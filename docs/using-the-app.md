## How to get started working with the GitHub Private Mirrors App (PMA)

1. Set up an organization to host your open source work. Many enterprises use a primary organization which mainly contains private repos or company-wide projects owned by the enterprise. Creating a separate organization which hosts your open-source efforts - both forks of upstream projects in use for this app, as well as open projects that expect a lot of external collaborators - makes for cleaner administrative/security boundaries.

2. Install the app into that organization. Currently you'll need to self-host the application, following the [instructions in the project's README](../README.md), but we are working towards a hosted solution as well - if this is a blocker for you please comment on [this issue](https://github.com/github-community-projects/private-mirrors/issues/122) to register your interest and say more about your use case.

3. Fork an upstream project into the organization's namespace. This will create your **public fork**. A decision point for administrators is whether to permit any user to fork new projects into the organizations, or restrict the ability to fork. These permissions are managed by [the organization's forking policy](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-the-forking-policy-for-your-organization). A more permissive posture can lower the barrier to contribution, but be careful not to circumvent company policy on approving upstream work.

4. Go the app's URL and authenticate to it. If your account is in the list of allowed usernames, you'll see a list of your organizations that the app is managing. Click on your org's name and you'll see a list of all the public forks in the organization.

![List of public forks inside the organization](images/public-forks-inside-org.png)

5. Click on the name of the public fork you just created. Click **Create mirror** and give it an unambiguous name, then click **Confirm**. This will create a **private mirror** of the repo. The app syncs commits on the private mirror's default branch to a new branch on the public fork. For example, the default branch of a private mirror named `silverteam-website` will be synced to a branch named `silverteam-website` on the public fork. So it's a good idea to be verbose in your name and describe how this fork will be used. PMA's workflow supports multiple private mirrors per public fork, to enable different individuals or teams to work on the default branches of their respective mirrors without interefering with each other.

![Dialog showing creation of new private mriror](images/create-new-mirror.png)

6. As the app creates the private mirror, it also adds some basic branch protection rules to require approvals before merge, but you'll likely want to customize these with additional checks to meet your internal requirements for compliance or IP review. Go to the newly-created mirror's **Settings** page and add or modify the rules under **Branches**.

![Branch protection rules in the private mirror's settings](images/branch-protection.png)

The mirror should now be ready for PRs!

## PR workflow once a mirror is active

1. Create a pull request against the private mirror repo

2. Review and merge the PR - at this step, if issues come up that require the deletion of code in the PR, you should "squash history" in the PR so the merge commit does not contain traces of the unwanted code.

3. Once it's merged, the app will automatically sync the private mirror to your public fork, updating a branch whose name matches the name of the private mirror (`silverteam-website`, in this example).

4. You can then use that branch of the public fork as the base to open a PR to the upstream repository.
