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

    // Filter feeds by date
    const filteredFeeds = _filterFeedsByDate(allFeeds, days);

    // Sort feeds by date in descending order
    filteredFeeds.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // TODO: Create an issue in the workflow repo listing all rss feed items with their hyperlink, publication date, and title. Label the issue as "news-update".
    if (!dryRun) {
      const issueBody = filteredFeeds.map(item => `- [${item.title}](${item.link}) - ${item.pubDate}`).join('\n');
      const issue = await octokit.rest.issues.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      title: 'News Update',
      body: issueBody,
      labels: ['news-update']
      });
    }

    core.setOutput('feeds', JSON.stringify(filteredFeeds));

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

/**
 * Filters the feeds by the given number of days.
 * @param {Array} feeds - The array of feed items.
 * @param {number} days - The number of days to filter by.
 * @returns {Array} - The filtered array of feed items.
 */
function _filterFeedsByDate(feeds, days) {
  const now = new Date();
  return feeds.filter(item => {
    const pubDate = new Date(item.pubDate);
    const diffTime = Math.abs(now - pubDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  });
}

module.exports = {
  _getRssFeed,
  _formatAndPrintLogOutput,
  _filterFeedsByDate
};

run();
