/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { TRPCError } from '@trpc/server'
import simpleGit, { SimpleGitOptions } from 'simple-git'
import { generateAuthUrl } from 'utils/auth'
import { temporaryDirectory } from 'utils/dir'
import { getConfig } from '../../bot/config'
import {
  appOctokit,
  getAuthenticatedOctokit,
  installationOctokit,
} from '../../bot/octokit'
import { logger } from '../../utils/logger'
import {
  CreateMirrorSchema,
  DeleteMirrorSchema,
  EditMirrorSchema,
  ListMirrorsSchema,
} from './schema'

const reposApiLogger = logger.getSubLogger({ name: 'repos-api' })

// Creates a mirror of a forked repo
export const createMirrorHandler = async ({
  input,
}: {
  input: CreateMirrorSchema
}) => {
  try {
    reposApiLogger.info('createMirror', { input: input })

    const config = await getConfig(input.orgId)

    reposApiLogger.debug('Fetched config', { config })

    const { publicOrg, privateOrg } = config

    const octokitData = await getAuthenticatedOctokit(publicOrg, privateOrg)
    const contributionOctokit = octokitData.contribution.octokit
    const contributionAccessToken = octokitData.contribution.accessToken

    const privateOctokit = octokitData.private.octokit
    const privateInstallationId = octokitData.private.installationId
    const privateAccessToken = octokitData.private.accessToken

    const orgData = await contributionOctokit.rest.orgs.get({
      org: publicOrg,
    })

    await contributionOctokit.rest.repos
      .get({
        owner: orgData.data.login,
        repo: input.newRepoName,
      })
      .then((res) => {
        // if we get a response, then we know the repo exists so we throw an error
        if (res.status === 200) {
          reposApiLogger.info(
            `Repo ${orgData.data.login}/${input.newRepoName} already exists`,
          )

          throw new Error(
            `Repo ${orgData.data.login}/${input.newRepoName} already exists`,
          )
        }
      })
      .catch((error) => {
        // catch and rethrow the error if the repo already exists
        if ((error as Error).message.includes('already exists')) {
          throw error
        }

        // if there is a real error, then we log it and throw it
        if (!(error as Error).message.includes('Not Found')) {
          reposApiLogger.error('Not found', { error })
          throw error
        }
      })

    try {
      const forkData = await contributionOctokit.rest.repos.get({
        owner: input.forkRepoOwner,
        repo: input.forkRepoName,
      })

      // Now create a temporary directory to clone the repo into
      const tempDir = temporaryDirectory()

      const options: Partial<SimpleGitOptions> = {
        config: [
          `user.name=pma[bot]`,
          // We want to use the private installation ID as the email so that we can push to the private repo
          `user.email=${privateInstallationId}+pma[bot]@users.noreply.github.com`,
          // Disable any global git hooks to prevent potential interference when running the app locally
          'core.hooksPath=/dev/null',
        ],
      }
      const git = simpleGit(tempDir, options)
      const remote = generateAuthUrl(
        contributionAccessToken,
        input.forkRepoOwner,
        input.forkRepoName,
      )

      await git.clone(remote, tempDir)

      // Get the organization custom properties
      const orgCustomProps =
        await privateOctokit.rest.orgs.getAllCustomProperties({
          org: privateOrg,
        })

      // Creates custom property fork in the org if it doesn't exist
      if (
        !orgCustomProps.data.some(
          (prop: { property_name: string }) => prop.property_name === 'fork',
        )
      ) {
        await privateOctokit.rest.orgs.createOrUpdateCustomProperty({
          org: privateOrg,
          custom_property_name: 'fork',
          value_type: 'string',
        })
      }

      // This repo needs to be created in the private org
      const newRepo = await privateOctokit.rest.repos.createInOrg({
        name: input.newRepoName,
        org: privateOrg,
        private: true,
        description: `Mirror of ${input.forkRepoOwner}/${input.forkRepoName}`,
        custom_properties: {
          fork: `${input.forkRepoOwner}/${input.forkRepoName}`,
        },
      })

      reposApiLogger.info('Created new repo', { newRepo })

      // apply settings for actions
      await privateOctokit.request(
        'PUT /repos/{owner}/{repo}/actions/permissions',
        {
          owner: privateOrg,
          repo: input.newRepoName,
          enabled: input.settings.actions.enabled,
          allowed_actions: input.settings.actions.enabled
            ? input.settings.actions.allowedActions
            : undefined,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      )

      reposApiLogger.debug('Applied settings for actions for repo', {
        owner: privateOrg,
        repo: input.newRepoName,
        enabled: input.settings.actions.enabled,
        allowed_actions: input.settings.actions.allowedActions,
      })

      const defaultBranch = forkData.data.default_branch

      // Add the mirror remote
      const upstreamRemote = generateAuthUrl(
        privateAccessToken,
        newRepo.data.owner.login,
        newRepo.data.name,
      )
      await git.addRemote('upstream', upstreamRemote)
      await git.push('upstream', defaultBranch)

      // Create a new branch on both
      await git.checkoutBranch(input.newBranchName, defaultBranch)
      await git.push('origin', input.newBranchName)

      reposApiLogger.info('Mirror created', {
        org: newRepo.data.owner.login,
        name: newRepo.data.name,
      })

      return {
        success: true,
        data: newRepo.data,
      }
    } catch (error) {
      // Clean up the private mirror repo made
      await privateOctokit.rest.repos.delete({
        owner: privateOrg,
        repo: input.newRepoName,
      })

      throw error
    }
  } catch (error) {
    reposApiLogger.error('Error creating mirror', { error })

    const message =
      (error as any)?.response?.data?.errors?.[0]?.message ??
      (error as any)?.response?.data?.message ??
      (error as Error)?.message ??
      'An error occurred'

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    })
  }
}

// Lists all the mirrors of a forked repo
export const listMirrorsHandler = async ({
  input,
}: {
  input: ListMirrorsSchema
}) => {
  try {
    reposApiLogger.info('Fetching mirrors', { input })

    const config = await getConfig(input.orgId)

    const installationId = await appOctokit().rest.apps.getOrgInstallation({
      org: config.privateOrg,
    })

    const octokit = installationOctokit(String(installationId.data.id))

    const privateOrgData = await octokit.rest.orgs.get({
      org: config.privateOrg,
    })
    const publicOrgData = await octokit.rest.orgs.get({ org: input.orgId })

    const repos = await octokit.paginate(
      octokit.rest.search.repos,
      {
        q: `org:"${privateOrgData.data.login}"+props.fork:"${publicOrgData.data.login}/${input.forkName}" org:"${privateOrgData.data.login}"&mirror:"${publicOrgData.data.login}/${input.forkName}"+in:description`,
        order: 'desc',
        sort: 'updated',
      },
      (response) => response.data,
    )

    return repos
  } catch (error) {
    reposApiLogger.info('Failed to fetch mirrors', { input, error })

    const message =
      (error as any)?.response?.data?.errors?.[0]?.message ??
      (error as any)?.response?.data?.message ??
      (error as Error)?.message ??
      'An error occurred'

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    })
  }
}

// Edits the name of a mirror
export const editMirrorHandler = async ({
  input,
}: {
  input: EditMirrorSchema
}) => {
  try {
    reposApiLogger.info('Editing mirror', { input })

    const config = await getConfig(input.orgId)

    const installationId = await appOctokit().rest.apps.getOrgInstallation({
      org: config.privateOrg,
    })

    const octokit = installationOctokit(String(installationId.data.id))

    const repo = await octokit.rest.repos.update({
      owner: config.privateOrg,
      repo: input.mirrorName,
      name: input.newMirrorName,
    })

    return {
      success: true,
      data: repo.data,
    }
  } catch (error) {
    reposApiLogger.error('Failed to edit mirror', { input, error })

    const message =
      (error as any)?.response?.data?.errors?.[0]?.message ??
      (error as any)?.response?.data?.message ??
      (error as Error)?.message ??
      'An error occurred'

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    })
  }
}

// Deletes a mirror
export const deleteMirrorHandler = async ({
  input,
}: {
  input: DeleteMirrorSchema
}) => {
  try {
    reposApiLogger.info('Deleting mirror', { input })

    const config = await getConfig(input.orgId)

    const installationId = await appOctokit().rest.apps.getOrgInstallation({
      org: config.privateOrg,
    })

    const octokit = installationOctokit(String(installationId.data.id))

    await octokit.rest.repos.delete({
      owner: config.privateOrg,
      repo: input.mirrorName,
    })

    return {
      success: true,
    }
  } catch (error) {
    reposApiLogger.error('Failed to delete mirror', { input, error })

    const message =
      (error as any)?.response?.data?.errors?.[0]?.message ??
      (error as any)?.response?.data?.message ??
      (error as Error)?.message ??
      'An error occurred'

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    })
  }
}
