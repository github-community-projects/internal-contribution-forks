import { ChevronRightIcon } from "@primer/octicons-react";
import { ActionList, Avatar, Box, Octicon } from "@primer/react";
import { personalOctokit } from "bot/octokit";
import { getAuthServerSideProps } from "components/auth-guard";
import { useSession } from "next-auth/react";
import { FC, useEffect, useState } from "react";

interface OrganizationsProps {}

const Organizations: FC<OrganizationsProps> = () => {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<
    Awaited<ReturnType<typeof getAllOrganizations>>
  >([]);

  // fetch all the organizations a user is in via octokit
  const getAllOrganizations = async (accessToken: string) => {
    const octokit = personalOctokit(accessToken);
    const data = await octokit.orgs.listForAuthenticatedUser();
    return data.data;
  };

  useEffect(() => {
    // TODO: Make this type work
    const { accessToken } = (session?.user as any) ?? {};
    if (!accessToken) {
      return;
    }

    getAllOrganizations(accessToken).then((orgs) => {
      setOrganizations(orgs);
    });
  }, [session]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <h1>Organizations</h1>
      <Box>
        <ActionList showDividers>
          {organizations.map((organization) => (
            <ActionList.LinkItem
              key={organization.id}
              href={`/orgs/${organization.id}`}
            >
              <ActionList.LeadingVisual>
                <Avatar src={organization.avatar_url} />
              </ActionList.LeadingVisual>
              <Box>
                {organization.login} {organization.description}
              </Box>
              <ActionList.TrailingVisual>
                <Octicon icon={ChevronRightIcon} />
              </ActionList.TrailingVisual>
            </ActionList.LinkItem>
          ))}
        </ActionList>
      </Box>
    </Box>
  );
};

export default Organizations;

export const getServerSideProps = getAuthServerSideProps;
