const core = require('@actions/core');
const github = require('@actions/github');
const Parser = require('rss-parser');

async function run() {
  try {
    const token = core.getInput('token');
    const dryRun = core.getBooleanInput('dry-run');
    const labels = core.getMultilineInput('labels');
    const days = core.getInput('days');

    const baseUrl = 'https://github.blog/feed/?s=';
    const octokit = github.getOctokit(token);

    const allFeeds = [];
    
    for (const label of labels) {
      const feed = await _getRssFeed(baseUrl, label);

      feed.items.forEach(item => {
        allFeeds.push(item);
      });

      await _formatAndPrintLogOutput(feed);
    }

    const filteredFeeds = _filterFeedsByDate(allFeeds, days);
    const sortedFeeds = _sortFeedsByDate(filteredFeeds);

    if (!dryRun) {
      const issueBody = sortedFeeds.map(item => `- [${item.title}](${item.link}) - ${item.pubDate}`).join('\n');
      const issueTitle = _getIssueTitle(sortedFeeds);
      const issue = await octokit.rest.issues.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        title: issueTitle,
        body: issueBody,
        labels: ['news-update']
      });
    }

    core.setOutput('feeds', JSON.stringify(sortedFeeds));

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function _getRssFeed(url, label) {
  const rssFeedUrl = `${url}${label}`;
  core.info(`Getting RSS feed for ${rssFeedUrl}...`)
  const parser = new Parser();
  const feed = await parser.parseURL(rssFeedUrl);

  return feed;
}

function _filterFeedsByDate(feeds, days) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return feeds.filter(feed => new Date(feed.pubDate) >= cutoffDate);
}

function _sortFeedsByDate(feeds) {
  return feeds.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

function _getIssueTitle(feeds) {
  if (feeds.length === 0) {
    return 'News Update';
  }

  const firstDate = new Date(feeds[0].pubDate);
  const lastDate = new Date(feeds[feeds.length - 1].pubDate);

  return `News Update (${firstDate.toDateString()} - ${lastDate.toDateString()})`;
}

/**
 * Formats and prints the log output for the given feed.
 * @param {Object} feed - The feed object.
 * @returns {Promise<void>} - A promise that resolves when the log output is printed.
 */
async function _formatAndPrintLogOutput(feed) {
  feed.items.forEach(item => {
    console.log('---');
    console.log(`Title: ${item.title}`);
    console.log(`Link: ${item.link}`);
    console.log(`PubDate: ${item.pubDate}`);
  });
}

module.exports = {
  _getRssFeed,
  _formatAndPrintLogOutput
};

run();
