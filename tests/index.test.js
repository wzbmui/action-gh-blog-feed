const { _getRssFeed, _formatAndPrintLogOutput, _filterFeedsByDate, _sortFeedsByDate } = require('../index');
const sinon = require('sinon');
const { expect } = require('chai');

describe('RSS Feed Functions', () => {
  describe('_getRssFeed', () => {
    it('should fetch and parse RSS feed', async () => {
      const url = 'https://github.blog/feed/?s=actions';
      const label = 'actions';
      const feed = await _getRssFeed(url, label);
      expect(feed).to.have.property('items');
    });
  });

  describe('_formatAndPrintLogOutput', () => {
    it('should format and print log output', async () => {
      const feed = {
        items: [
          { title: 'Test Title', link: 'https://test.com', pubDate: '2023-01-01' }
        ]
      };
      const consoleSpy = sinon.spy(console, 'log');
      await _formatAndPrintLogOutput(feed);
      expect(consoleSpy.calledWith('---')).to.be.true;
      expect(consoleSpy.calledWith('Title: Test Title')).to.be.true;
      expect(consoleSpy.calledWith('Link: https://test.com')).to.be.true;
      expect(consoleSpy.calledWith('PubDate: 2023-01-01')).to.be.true;
      consoleSpy.restore();
    });
  });

  describe('_filterFeedsByDate', () => {
    it('should filter feeds by date', () => {
      const feeds = [
        { pubDate: '2023-01-01' },
        { pubDate: '2023-01-05' }
      ];
      const days = 3;
      const filteredFeeds = _filterFeedsByDate(feeds, days);
      expect(filteredFeeds).to.have.lengthOf(1);
      expect(filteredFeeds[0].pubDate).to.equal('2023-01-05');
    });
  });

  describe('_sortFeedsByDate', () => {
    it('should sort feeds by date in descending order', () => {
      const feeds = [
        { pubDate: '2023-01-01' },
        { pubDate: '2023-01-05' }
      ];
      const sortedFeeds = _sortFeedsByDate(feeds);
      expect(sortedFeeds[0].pubDate).to.equal('2023-01-05');
      expect(sortedFeeds[1].pubDate).to.equal('2023-01-01');
    });
  });
});
