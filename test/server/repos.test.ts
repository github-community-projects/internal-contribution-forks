// TODO: We should only mock out clone and push but keep the rest of the options
// the same. This will allow us to test the actual git commands.
const stubbedGit = {
  clone: jest.fn(),
  push: jest.fn(),
  addRemote: jest.fn(),
  fetch: jest.fn(),
  checkoutBranch: jest.fn(),
  mergeFromTo: jest.fn(),
}

jest.mock('simple-git', () => {
  return () => stubbedGit
})

import * as config from '../../src/bot/config'
import reposRouter from '../../src/server/repos/router'
import * as auth from '../../src/utils/auth'
import { t } from '../../src/utils/trpc-server'
import { Octomock } from '../octomock'
import { createTestContext } from '../utils/auth'
const om = new Octomock()

jest.mock('../../src/bot/config')
jest.mock('../../src/bot/octokit', () => ({
  generateAppAccessToken: async () => 'fake-token',
  appOctokit: () => om.getOctokitImplementation(),
  installationOctokit: () => om.getOctokitImplementation(),
  getAuthenticatedOctokit: () => ({
    contribution: {
      accessToken: 'fake-token',
      octokit: om.getOctokitImplementation(),
      installationId: 'fake-installation-id',
    },
    private: {
      accessToken: 'fake-token',
      octokit: om.getOctokitImplementation(),
      installationId: 'fake-installation-id',
    },
  }),
}))
jest.mock('../../src/utils/auth')

const fakeForkRepo = {
  status: 200,
  data: {
    clone_url: 'https://github.com/github-test/fork-test.git',
    login: 'fork-test',
    owner: {
      login: 'github-test',
    },
  },
}

const fakeMirrorRepo = {
  status: 200,
  data: {
    clone_url: 'https://github.com/github-test/mirror-test.git',
    login: 'mirror-test',
    owner: {
      login: 'github-test',
    },
  },
}

const fakeOrg = {
  status: 200,
  data: {
    login: 'github-test',
  },
}

const fakeInstallationId = 'fake-installation-id'

const fakeOrgInstallation = {
  status: 200,
  data: {
    id: fakeInstallationId,
  },
}

const repoNotFound = {
  status: 404,
  data: {
    message: 'Not Found',
  },
}

const fakeOrgCustomProperties = {
  status: 200,
  data: [
    {
      property_name: 'fork',
      value_type: 'string',
      required: false,
      values_editable_by: 'org_actors',
    },
  ],
}

jest.spyOn(auth, 'checkGitHubAuth').mockResolvedValue()

describe('Repos router', () => {
  beforeEach(() => {
    om.resetMocks()
    jest.resetAllMocks()
  })

  it('should create a mirror when repo does not exist exist', async () => {
    const caller = t.createCallerFactory(reposRouter)(createTestContext())

    const configSpy = jest.spyOn(config, 'getConfig').mockResolvedValue({
      publicOrg: 'github',
      privateOrg: 'github-test',
    })

    om.mockFunctions.rest.apps.getOrgInstallation.mockResolvedValue(
      fakeOrgInstallation,
    )
    om.mockFunctions.rest.orgs.get.mockResolvedValue(fakeOrg)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(repoNotFound)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(fakeForkRepo)
    om.mockFunctions.rest.orgs.getAllCustomProperties.mockResolvedValue(
      fakeOrgCustomProperties,
    )
    om.mockFunctions.rest.orgs.createOrUpdateCustomProperty.mockResolvedValue(
      fakeOrgCustomProperties,
    )
    om.mockFunctions.rest.repos.createInOrg.mockResolvedValue(fakeMirrorRepo)
    om.mockFunctions.request.mockResolvedValue({
      status: 204,
    })

    const res = await caller.createMirror({
      forkId: 'test',
      orgId: 'test',
      forkRepoName: 'fork-test',
      forkRepoOwner: 'github',
      newBranchName: 'test',
      newRepoName: 'test',
      settings: {
        actions: {
          enabled: false,
        },
      },
    })

    // TODO: use real git operations and verify fs state after
    expect(configSpy).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.rest.repos.get).toHaveBeenCalledTimes(2)
    expect(stubbedGit.clone).toHaveBeenCalledTimes(1)
    expect(stubbedGit.addRemote).toHaveBeenCalledTimes(1)
    expect(stubbedGit.push).toHaveBeenCalledTimes(2)
    expect(stubbedGit.checkoutBranch).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledWith(
      'PUT /repos/{owner}/{repo}/actions/permissions',
      {
        owner: 'github-test',
        repo: 'test',
        enabled: false,
        allowed_actions: undefined,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )

    expect(res).toEqual({
      success: true,
      data: fakeMirrorRepo.data,
    })
  })

  it('should throw an error when repo already exists', async () => {
    const caller = t.createCallerFactory(reposRouter)(createTestContext())

    const configSpy = jest.spyOn(config, 'getConfig').mockResolvedValue({
      publicOrg: 'github',
      privateOrg: 'github-test',
    })

    om.mockFunctions.rest.apps.getOrgInstallation.mockResolvedValue(
      fakeOrgInstallation,
    )
    om.mockFunctions.rest.orgs.get.mockResolvedValue(fakeOrg)
    om.mockFunctions.rest.repos.get.mockResolvedValue(fakeMirrorRepo)
    om.mockFunctions.rest.repos.delete.mockResolvedValue({})
    om.mockFunctions.request.mockResolvedValue({
      status: 204,
    })

    await caller
      .createMirror({
        forkId: 'test',
        orgId: 'test',
        forkRepoName: 'fork-test',
        forkRepoOwner: 'github',
        newBranchName: 'test',
        newRepoName: 'test',
        settings: {
          actions: {
            enabled: false,
          },
        },
      })
      .catch((error) => {
        expect(error.message).toEqual('Repo github-test/test already exists')
      })

    expect(configSpy).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.rest.repos.get).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.rest.repos.delete).toHaveBeenCalledTimes(0)
    expect(stubbedGit.clone).toHaveBeenCalledTimes(0)
    expect(om.mockFunctions.request).toHaveBeenCalledTimes(0)
  })

  it('should cleanup repos when there is an error', async () => {
    const caller = t.createCallerFactory(reposRouter)(createTestContext())

    const configSpy = jest.spyOn(config, 'getConfig').mockResolvedValue({
      publicOrg: 'github',
      privateOrg: 'github',
    })

    om.mockFunctions.rest.apps.getOrgInstallation.mockResolvedValue(
      fakeOrgInstallation,
    )
    om.mockFunctions.rest.orgs.get.mockResolvedValue(fakeOrg)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(repoNotFound)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(fakeMirrorRepo)
    om.mockFunctions.rest.repos.delete.mockResolvedValue({})
    om.mockFunctions.request.mockResolvedValue({
      status: 204,
    })

    stubbedGit.clone.mockRejectedValue(new Error('clone error'))

    await caller
      .createMirror({
        forkId: 'test',
        orgId: 'test',
        forkRepoName: 'fork-test',
        forkRepoOwner: 'github',
        newBranchName: 'test',
        newRepoName: 'test',
        settings: {
          actions: {
            enabled: false,
          },
        },
      })
      .catch((error) => {
        expect(error.message).toEqual('clone error')
      })

    expect(configSpy).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.rest.repos.get).toHaveBeenCalledTimes(2)
    expect(om.mockFunctions.rest.repos.delete).toHaveBeenCalledWith({
      owner: 'github',
      repo: 'test',
    })
    expect(stubbedGit.clone).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledTimes(0)
  })

  it('dual-org: should cleanup repos when there is an error', async () => {
    const caller = t.createCallerFactory(reposRouter)(createTestContext())

    const configSpy = jest.spyOn(config, 'getConfig').mockResolvedValue({
      publicOrg: 'github',
      privateOrg: 'github-test',
    })

    om.mockFunctions.rest.apps.getOrgInstallation.mockResolvedValue(
      fakeOrgInstallation,
    )
    om.mockFunctions.rest.orgs.get.mockResolvedValue(fakeOrg)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(repoNotFound)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(fakeMirrorRepo)
    om.mockFunctions.rest.repos.delete.mockResolvedValue({})

    stubbedGit.clone.mockRejectedValue(new Error('clone error'))

    await caller
      .createMirror({
        forkId: 'test',
        orgId: 'test',
        forkRepoName: 'fork-test',
        forkRepoOwner: 'github',
        newBranchName: 'test',
        newRepoName: 'test',
        settings: {
          actions: {
            enabled: false,
          },
        },
      })
      .catch((error) => {
        expect(error.message).toEqual('clone error')
      })

    expect(configSpy).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.rest.repos.get).toHaveBeenCalledTimes(2)
    expect(om.mockFunctions.rest.repos.delete).toHaveBeenCalledWith({
      owner: 'github-test',
      repo: 'test',
    })
    expect(stubbedGit.clone).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledTimes(0)
  })

  it('should change settings of a repo for actions', async () => {
    const caller = t.createCallerFactory(reposRouter)(createTestContext())

    const configSpy = jest.spyOn(config, 'getConfig').mockResolvedValue({
      publicOrg: 'github',
      privateOrg: 'github-test',
    })

    om.mockFunctions.rest.apps.getOrgInstallation.mockResolvedValue(
      fakeOrgInstallation,
    )
    om.mockFunctions.rest.orgs.get.mockResolvedValue(fakeOrg)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(repoNotFound)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(fakeForkRepo)
    om.mockFunctions.rest.orgs.getAllCustomProperties.mockResolvedValue(
      fakeOrgCustomProperties,
    )
    om.mockFunctions.rest.orgs.createOrUpdateCustomProperty.mockResolvedValue(
      fakeOrgCustomProperties,
    )
    om.mockFunctions.rest.repos.createInOrg.mockResolvedValue(fakeMirrorRepo)
    om.mockFunctions.request.mockResolvedValue({
      status: 204,
    })

    const res = await caller.createMirror({
      forkId: 'test',
      orgId: 'test',
      forkRepoName: 'fork-test',
      forkRepoOwner: 'github',
      newBranchName: 'test',
      newRepoName: 'test',
      settings: {
        actions: {
          enabled: true,
          allowedActions: 'all',
        },
      },
    })

    // TODO: use real git operations and verify fs state after
    expect(configSpy).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.rest.repos.get).toHaveBeenCalledTimes(2)
    expect(stubbedGit.clone).toHaveBeenCalledTimes(1)
    expect(stubbedGit.addRemote).toHaveBeenCalledTimes(1)
    expect(stubbedGit.push).toHaveBeenCalledTimes(2)
    expect(stubbedGit.checkoutBranch).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledWith(
      'PUT /repos/{owner}/{repo}/actions/permissions',
      {
        owner: 'github-test',
        repo: 'test',
        enabled: true,
        allowed_actions: 'all',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )

    expect(res).toEqual({
      success: true,
      data: fakeMirrorRepo.data,
    })
  })

  it('allowed_actions should be undefined when actions are not enabled', async () => {
    const caller = t.createCallerFactory(reposRouter)(createTestContext())

    const configSpy = jest.spyOn(config, 'getConfig').mockResolvedValue({
      publicOrg: 'github',
      privateOrg: 'github-test',
    })

    om.mockFunctions.rest.apps.getOrgInstallation.mockResolvedValue(
      fakeOrgInstallation,
    )
    om.mockFunctions.rest.orgs.get.mockResolvedValue(fakeOrg)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(repoNotFound)
    om.mockFunctions.rest.repos.get.mockResolvedValueOnce(fakeForkRepo)
    om.mockFunctions.rest.orgs.getAllCustomProperties.mockResolvedValue(
      fakeOrgCustomProperties,
    )
    om.mockFunctions.rest.orgs.createOrUpdateCustomProperty.mockResolvedValue(
      fakeOrgCustomProperties,
    )
    om.mockFunctions.rest.repos.createInOrg.mockResolvedValue(fakeMirrorRepo)
    om.mockFunctions.request.mockResolvedValue({
      status: 204,
    })

    const res = await caller.createMirror({
      forkId: 'test',
      orgId: 'test',
      forkRepoName: 'fork-test',
      forkRepoOwner: 'github',
      newBranchName: 'test',
      newRepoName: 'test',
      settings: {
        actions: {
          enabled: false,
          allowedActions: 'all',
        },
      },
    })

    // TODO: use real git operations and verify fs state after
    expect(configSpy).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.rest.repos.get).toHaveBeenCalledTimes(2)
    expect(stubbedGit.clone).toHaveBeenCalledTimes(1)
    expect(stubbedGit.addRemote).toHaveBeenCalledTimes(1)
    expect(stubbedGit.push).toHaveBeenCalledTimes(2)
    expect(stubbedGit.checkoutBranch).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledTimes(1)
    expect(om.mockFunctions.request).toHaveBeenCalledWith(
      'PUT /repos/{owner}/{repo}/actions/permissions',
      {
        owner: 'github-test',
        repo: 'test',
        enabled: false,
        allowed_actions: undefined,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )

    expect(res).toEqual({
      success: true,
      data: fakeMirrorRepo.data,
    })
  })

  it('reject repository names over the character limit', async () => {
    const caller = t.createCallerFactory(reposRouter)(createTestContext())

    await caller
      .createMirror({
        forkId: 'test',
        orgId: 'test',
        forkRepoName: 'fork-test',
        forkRepoOwner: 'github',
        newBranchName: 'test',
        newRepoName: 'a'.repeat(101),
        settings: {
          actions: {
            enabled: false,
          },
        },
      })
      .catch((error) => {
        expect(error.message).toMatch(
          /String must contain at most 100 character\(s\)/,
        )
      })
  })
})
