import { getInput, setOutput, setFailed } from "@actions/core";
import { getOctokit } from "@actions/github";
import { get } from "lodash-es";
import query from "./query.gql";

async function getDeployment(args, retryInterval) {
  let deployments = [];
  while (deployments.length === 0) {  // Check for an empty array
    deployments = await tryGetResult(args);
    if (deployments.length === 0) {  // Still check and log if no deployments
      console.log(
        `No deployments found, waiting ${retryInterval} milliseconds and trying again`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }
  return deployments;
}


async function tryGetResult(args) {
  const octokit = getOctokit(getInput("token", { required: true }));
  const result = await octokit.graphql(query, args);

  console.log(JSON.stringify(result.repository.ref.target.deployments.edges))

  await waitForRateLimitReset(result);

  const edges = get(result, "repository.ref.target.deployments.edges");

  if (!edges) return null;

  // Map each edge to its environment URL
  return edges.map(edge => get(edge, 'node.latestStatus.environmentUrl', null));
}

async function waitForRateLimitReset(result) {
  const { cost, remaining, resetAt } = result.rateLimit;
  if (remaining >= cost) return;

  const timeToRateLimitReset =
    new Date(resetAt).getTime() - new Date().getTime();
  await new Promise((resolve) => setTimeout(resolve, timeToRateLimitReset));
}

async function run() {
  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const branch =
      process.env.GITHUB_HEAD_REF ||
      process.env.GITHUB_REF.match(/(?<=refs\/heads\/).+/g)[0];
    const retryInterval = Number(getInput("retryInterval"));

    const args = { repo, owner, branch };
    console.log("Starting to run with following input:", args);

    const deployments = await getDeployment(args, retryInterval);

    console.log(deployments)
    
    setOutput("deployments", JSON.stringify(deployments)); // Update output name and value
    console.log("Deployments set: ", JSON.stringify(deployments));
  } catch (error) {
    setFailed(error.message);
  }
}

run();
