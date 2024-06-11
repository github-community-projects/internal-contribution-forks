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
import { CreateMirrorSchema, ListMirrorsSchema } from './schema'

const reposApiLogger = logger.child({ name: 'repos-api' })

// Creates a mirror of a forked repo
export const createMirrorHandler = async ({
  input,
}: {
  input: CreateMirrorSchema
}) => {
  try {
    reposApiLogger.info('createMirror', { input })

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

    try {
      const exists = await contributionOctokit.rest.repos.get({
        owner: orgData.data.login,
        repo: input.newRepoName,
      })
      if (exists.status === 200) {
        reposApiLogger.info(
          `Repo ${orgData.data.login}/${input.newRepoName} already exists`,
        )
        throw new Error(
          `Repo ${orgData.data.login}/${input.newRepoName} already exists`,
        )
      }
    } catch (e) {
      // We just threw this error, so we know it's safe to rethrow
      if ((e as Error).message.includes('already exists')) {
        throw e
      }

      if (!(e as Error).message.includes('Not Found')) {
        logger.error('asdf')
        throw e
      }
    }

    try {
      const forkData = await contributionOctokit.rest.repos.get({
        owner: input.forkRepoOwner,
        repo: input.forkRepoName,
      })

      // Now create a temporary directory to clone the repo into
      const tempDir = temporaryDirectory()

      const options: Partial<SimpleGitOptions> = {
        config: [
          `user.name=internal-contribution-forks[bot]`,
          // We want to use the private installation ID as the email so that we can push to the private repo
          `user.email=${privateInstallationId}+internal-contribution-forks[bot]@users.noreply.github.com`,
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

      return {
        success: true,
        data: newRepo.data,
      }
    } catch (e) {
      // Clean up the private mirror repo made
      await privateOctokit.rest.repos.delete({
        owner: privateOrg,
        repo: input.newRepoName,
      })

      logger.error('asdf')

      throw e
    }
  } catch (error) {
    reposApiLogger.error(new Error('Error creating mirror'))

    return {
      success: false,
    }
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
    reposApiLogger.error(new Error('Failed to fetch mirrors'))

    return false
  }
}

// Edits the name of a mirror
export const editMirrorHandler = async ({
  input,
}: {
  input: { orgId: string; mirrorName: string; newMirrorName: string }
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
    reposApiLogger.error(new Error('Failed to edit mirror'))

    return {
      success: false,
    }
  }
}

// Deletes a mirror
export const deleteMirrorHandler = async ({
  input,
}: {
  input: {
    orgId: string
    orgName: string
    mirrorName: string
  }
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
    reposApiLogger.error(new Error('Failed to delete mirror'))

    return {
      success: false,
    }
  }
}
