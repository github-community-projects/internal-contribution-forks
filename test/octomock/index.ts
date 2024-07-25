// This is taken from https://github.com/Chocrates/octomock

let mockFunctions = {
  request: jest.fn(),
  config: {
    get: jest.fn(),
  },
  rest: {
    apps: {
      getOrgInstallation: jest.fn(),
    },
    orgs: {
      list: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      listBlockedUsers: jest.fn(),
      checkBlockedUser: jest.fn(),
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
      listHooks: jest.fn(),
      createHook: jest.fn(),
      getHook: jest.fn(),
      updateHook: jest.fn(),
      deleteHook: jest.fn(),
      pingHook: jest.fn(),
      listInstallations: jest.fn(),
      listPendingInvitations: jest.fn(),
      createInvitation: jest.fn(),
      listInvitationTeams: jest.fn(),
      listMembers: jest.fn(),
      checkMembership: jest.fn(),
      removeMember: jest.fn(),
      getMembership: jest.fn(),
      addOrUpdateMembership: jest.fn(),
      removeMembership: jest.fn(),
      listOutsideCollaborators: jest.fn(),
      removeOutsideCollaborator: jest.fn(),
      convertMemberToOutsideCollaborator: jest.fn(),
      listPublicMembers: jest.fn(),
      checkPublicMembership: jest.fn(),
      publicizeMembership: jest.fn(),
      concealMembership: jest.fn(),
      listMemberships: jest.fn(),
      getMembershipForAuthenticatedUser: jest.fn(),
      updateMembership: jest.fn(),
      listForAuthenticatedUser: jest.fn(),
      listForUser: jest.fn(),
      getAllCustomProperties: jest.fn(),
      createOrUpdateCustomProperty: jest.fn(),
    },
    repos: {
      listForOrg: jest.fn(),
      createInOrg: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      enableAutomatedSecurityFixes: jest.fn(),
      disableAutomatedSecurityFixes: jest.fn(),
      listBranches: jest.fn(),
      getBranch: jest.fn(),
      getBranchProtection: jest.fn(),
      updateBranchProtection: jest.fn(),
      removeBranchProtection: jest.fn(),
      getProtectedBranchAdminEnforcement: jest.fn(),
      addProtectedBranchAdminEnforcement: jest.fn(),
      removeProtectedBranchAdminEnforcement: jest.fn(),
      getProtectedBranchPullRequestReviewEnforcement: jest.fn(),
      updateProtectedBranchPullRequestReviewEnforcement: jest.fn(),
      removeProtectedBranchPullRequestReviewEnforcement: jest.fn(),
      getProtectedBranchRequiredSignatures: jest.fn(),
      addProtectedBranchRequiredSignatures: jest.fn(),
      removeProtectedBranchRequiredSignatures: jest.fn(),
      getProtectedBranchRequiredStatusChecks: jest.fn(),
      updateProtectedBranchRequiredStatusChecks: jest.fn(),
      removeProtectedBranchRequiredStatusChecks: jest.fn(),
      listProtectedBranchRequiredStatusChecksContexts: jest.fn(),
      replaceProtectedBranchRequiredStatusChecksContexts: jest.fn(),
      addProtectedBranchRequiredStatusChecksContexts: jest.fn(),
      removeProtectedBranchRequiredStatusChecksContext: jest.fn(),
      getProtectedBranchRestrictions: jest.fn(),
      removeProtectedBranchRestrictions: jest.fn(),
      getAppsWithAccessToProtectedBranch: jest.fn(),
      listAppsWithAccessToProtectedBranch: jest.fn(),
      replaceProtectedBranchAppRestrictions: jest.fn(),
      addProtectedBranchAppRestrictions: jest.fn(),
      removeProtectedBranchAppRestrictions: jest.fn(),
      getTeamsWithAccessToProtectedBranch: jest.fn(),
      listProtectedBranchTeamRestrictions: jest.fn(),
      listTeamsWithAccessToProtectedBranch: jest.fn(),
      replaceProtectedBranchTeamRestrictions: jest.fn(),
      addProtectedBranchTeamRestrictions: jest.fn(),
      removeProtectedBranchTeamRestrictions: jest.fn(),
      getUsersWithAccessToProtectedBranch: jest.fn(),
      listProtectedBranchUserRestrictions: jest.fn(),
      listUsersWithAccessToProtectedBranch: jest.fn(),
      replaceProtectedBranchUserRestrictions: jest.fn(),
      addProtectedBranchUserRestrictions: jest.fn(),
      removeProtectedBranchUserRestrictions: jest.fn(),
      listCollaborators: jest.fn(),
      checkCollaborator: jest.fn(),
      addCollaborator: jest.fn(),
      removeCollaborator: jest.fn(),
      getCollaboratorPermissionLevel: jest.fn(),
      listCommitComments: jest.fn(),
      getCommitComment: jest.fn(),
      updateCommitComment: jest.fn(),
      deleteCommitComment: jest.fn(),
      listCommits: jest.fn(),
      listBranchesForHeadCommit: jest.fn(),
      listCommentsForCommit: jest.fn(),
      createCommitComment: jest.fn(),
      listPullRequestAssociatedWithCommit: jest.fn(),
      getCommit: jest.fn(),
      getCombinedStatusForRef: jest.fn(),
      listStatusesForRef: jest.fn(),
      retrieveCommunityProfileMetrics: jest.fn(),
      compareCommits: jest.fn(),
      getContents: jest.fn(),
      createOrUpdateFile: jest.fn(),
      createFile: jest.fn(),
      updateFile: jest.fn(),
      deleteFile: jest.fn(),
      listContributors: jest.fn(),
      listDeployments: jest.fn(),
      createDeployment: jest.fn(),
      getDeployment: jest.fn(),
      listDeploymentStatuses: jest.fn(),
      createDeploymentStatus: jest.fn(),
      getDeploymentStatus: jest.fn(),
      createDispatchEvent: jest.fn(),
      listDownloads: jest.fn(),
      getDownload: jest.fn(),
      deleteDownload: jest.fn(),
      listForks: jest.fn(),
      createFork: jest.fn(),
      listHooks: jest.fn(),
      createHook: jest.fn(),
      getHook: jest.fn(),
      updateHook: jest.fn(),
      deleteHook: jest.fn(),
      pingHook: jest.fn(),
      testPushHook: jest.fn(),
      listInvitations: jest.fn(),
      deleteInvitation: jest.fn(),
      updateInvitation: jest.fn(),
      listDeployKeys: jest.fn(),
      addDeployKey: jest.fn(),
      getDeployKey: jest.fn(),
      removeDeployKey: jest.fn(),
      listLanguages: jest.fn(),
      merge: jest.fn(),
      getPages: jest.fn(),
      enablePagesSite: jest.fn(),
      disablePagesSite: jest.fn(),
      updateInformationAboutPagesSite: jest.fn(),
      requestPageBuild: jest.fn(),
      listPagesBuilds: jest.fn(),
      getLatestPagesBuild: jest.fn(),
      getPagesBuild: jest.fn(),
      getReadme: jest.fn(),
      listReleases: jest.fn(),
      createRelease: jest.fn(),
      getReleaseAsset: jest.fn(),
      updateReleaseAsset: jest.fn(),
      deleteReleaseAsset: jest.fn(),
      getLatestRelease: jest.fn(),
      getReleaseByTag: jest.fn(),
      getRelease: jest.fn(),
      updateRelease: jest.fn(),
      deleteRelease: jest.fn(),
      listAssetsForRelease: jest.fn(),
      uploadReleaseAsset: jest.fn(),
      getCodeFrequencyStats: jest.fn(),
      getCommitActivityStats: jest.fn(),
      getContributorsStats: jest.fn(),
      getParticipationStats: jest.fn(),
      getPunchCardStats: jest.fn(),
      createStatus: jest.fn(),
      listTags: jest.fn(),
      listTeams: jest.fn(),
      listTopics: jest.fn(),
      replaceTopics: jest.fn(),
      getClones: jest.fn(),
      getTopPaths: jest.fn(),
      getTopReferrers: jest.fn(),
      getViews: jest.fn(),
      transfer: jest.fn(),
      checkVulnerabilityAlerts: jest.fn(),
      enableVulnerabilityAlerts: jest.fn(),
      disableVulnerabilityAlerts: jest.fn(),
      getArchiveLink: jest.fn(),
      createUsingTemplate: jest.fn(),
      listPublic: jest.fn(),
      list: jest.fn(),
      createForAuthenticatedUser: jest.fn(),
      listInvitationsForAuthenticatedUser: jest.fn(),
      acceptInvitation: jest.fn(),
      declineInvitation: jest.fn(),
      listForUser: jest.fn(),
      getCommitRefSha: jest.fn(),
      getCustomPropertiesValues: jest.fn(),
    },
    issues: {
      list: jest.fn(),
      listForOrg: jest.fn(),
      listAssignees: jest.fn(),
      checkAssignee: jest.fn(),
      listForRepo: jest.fn(),
      create: jest.fn(),
      listCommentsForRepo: jest.fn(),
      getComment: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
      listEventsForRepo: jest.fn(),
      getEvent: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      addAssignees: jest.fn(),
      removeAssignees: jest.fn(),
      listComments: jest.fn(),
      createComment: jest.fn(),
      listEvents: jest.fn(),
      listLabelsOnIssue: jest.fn(),
      addLabels: jest.fn(),
      replaceLabels: jest.fn(),
      removeLabels: jest.fn(),
      removeLabel: jest.fn(),
      lock: jest.fn(),
      unlock: jest.fn(),
      listEventsForTimeline: jest.fn(),
      listLabelsForRepo: jest.fn(),
      createLabel: jest.fn(),
      getLabel: jest.fn(),
      updateLabel: jest.fn(),
      deleteLabel: jest.fn(),
      listMilestonesForRepo: jest.fn(),
      createMilestone: jest.fn(),
      getMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      listLabelsForMilestone: jest.fn(),
      listForAuthenticatedUser: jest.fn(),
    },
    actions: {
      cancelWorkflowRun: jest.fn(),
      createOrUpdateSecretForRepo: jest.fn(),
      createRegistrationToken: jest.fn(),
      createRemoveToken: jest.fn(),
      deleteArtifact: jest.fn(),
      deleteSecretFromRepo: jest.fn(),
      downloadArtifact: jest.fn(),
      getArtifact: jest.fn(),
      getPublicKey: jest.fn(),
      getSecret: jest.fn(),
      getSelfHostedRunner: jest.fn(),
      getWorkflow: jest.fn(),
      getWorkflowJob: jest.fn(),
      getWorkflowRun: jest.fn(),
      listArtifactsForRepo: jest.fn(),
      listDownloadsForSelfHostedRunnerApplication: jest.fn(),
      listJobsForWorkflowRun: jest.fn(),
      listRepoWorkflowRuns: jest.fn(),
      listRepoWorkflows: jest.fn(),
      listSecretsForRepo: jest.fn(),
      listSelfHostedRunnersForRepo: jest.fn(),
      listWorkflowJobLogs: jest.fn(),
      listWorkflowRunArtifacts: jest.fn(),
      listWorkflowRunLogs: jest.fn(),
      listWorkflowRuns: jest.fn(),
      reRunWorkflow: jest.fn(),
      removeSelfHostedRunner: jest.fn(),
    },
    core: {
      exportVariable: jest.fn(),
      setSecret: jest.fn(),
      addPath: jest.fn(),
      getInput: jest.fn((value) => value),
      setOutput: jest.fn(),
      setFailed: jest.fn((message) => {
        console.log(`MOCK FAILED: ${message}`)
      }),
      debug: jest.fn((message) => {
        console.log(`MOCK DEBUG: ${message}`)
      }),
      error: jest.fn((message) => {
        console.log(`MOCK ERROR: ${message}`)
      }),
      warning: jest.fn((message) => {
        console.log(`MOCK WARNING: ${message}`)
      }),
      info: jest.fn((message) => {
        console.log(`MOCK INFO: ${message}`)
      }),
      startGroup: jest.fn(),
      endGroup: jest.fn(),
      group: jest.fn(),
      saveState: jest.fn(),
      getState: jest.fn(),
    },
    users: {
      getAuthenticated: jest.fn(),
    },
  },
}

export class Octomock {
  mockFunctions: {
    rest: Record<string, Record<string, jest.Mock>>
    config: Record<string, jest.Mock>
    request: jest.Mock
  }
  defaultContext: { payload: { issue: { body: string; user: {} } } }

  mockGitHubImplementation: {
    context: {
      [key: string]: any
    }
    getOctokit: () => Octomock
    GitHub: typeof Octomock
  }

  mockCoreImplementation: {
    exportVariable: any
    setSecret: any
    addPath: any
    getInput: any
    setOutput: any
    setFailed: any
    debug: any
    error: any
    warning: any
    info: any
    startGroup: any
    endGroup: any
    group: any
    saveState: any
    getState: any
  }

  constructor() {
    this.defaultContext = {
      payload: {
        issue: {
          body: '',
          user: {},
        },
      },
    }

    this.mockFunctions = mockFunctions

    this.mockGitHubImplementation = {
      context: {},
      getOctokit: () => {
        return new Octomock()
      },
      GitHub: Octomock,
    }

    this.mockCoreImplementation = {
      exportVariable: this.mockFunctions.rest.core.exportVariable,
      setSecret: this.mockFunctions.rest.core.setSecret,
      addPath: this.mockFunctions.rest.core.addPath,
      getInput: this.mockFunctions.rest.core.getInput,
      setOutput: this.mockFunctions.rest.core.setOutput,
      setFailed: this.mockFunctions.rest.core.setFailed,
      debug: this.mockFunctions.rest.core.debug,
      error: this.mockFunctions.rest.core.error,
      warning: this.mockFunctions.rest.core.warning,
      info: this.mockFunctions.rest.core.info,
      startGroup: this.mockFunctions.rest.core.startGroup,
      endGroup: this.mockFunctions.rest.core.endGroup,
      group: this.mockFunctions.rest.core.group,
      saveState: this.mockFunctions.rest.core.saveState,
      getState: this.mockFunctions.rest.core.getState,
    }
  }

  getOctokitImplementation() {
    return this.mockFunctions
  }

  updateGitHubImplementation(implementation: {
    context: { payload?: any }
    getOctokit: () => Octomock
    GitHub: typeof Octomock
  }) {
    this.mockGitHubImplementation = implementation
  }

  getGitHubImplementation() {
    return this.mockGitHubImplementation
  }

  getCoreImplementation() {
    return this.mockCoreImplementation
  }

  resetMocks() {
    jest.resetAllMocks()
  }

  updateContext(context: {
    [x: string]: any
    payload?: { issue: { body: string; user: {} } }
  }) {
    for (let property in context) {
      this.mockGitHubImplementation.context[property] = context[property]
    }
  }

  getContext() {
    return this.mockGitHubImplementation.context
  }
}
