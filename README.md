# Get GitHub Blog entries

## Introduction

A GitHub Action that lists [GitHub Blog](https://github.blog/) entries that match a set of labels. The [GitHub Changelog](https://github.blog/changelog/) is also included.

## Inputs

- `token` - A token with `repo` scope
- `dry-run` - If `true`, the RSS feed will only be reported in the console log. If `false`, an issue will be created to list all RSS feed entries found.
- `labels` - A multi-line list of labels to search for. E.g. including `actions` will trigger the following search; `https://github.blog/feed/?s=actions`
- `days` - The number of days worth of posts to include in the list

## Outputs

- N/A

## Usage

### Example workflow

```yml
# .github/workflows/get-blog-entries.yml

name: Get GitHub blog entries

on:
  workflow_dispatch:

jobs:
  get-blog-rss:
    name: Get GitHub blog RSS
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Get GitHub Blog RSS
        id: get-github-blog-rss
        uses: ./
        with:
          token: ${{ secrets.MY_TOKEN }}
          dry-run: false
          labels: |
            'actions'
            'copilot'
          days: 7
```

## ToDo

- [ ] Reformat / polish to include blog post date span in issue title 
- [ ] Check and fix for vulnerable coding patterns
- [ ] Use GITHUB_TOKEN for API authentication if possible
- [ ] Add tests
- [ ] Add CI workflow with test suite
- [ ] Update README with updated info
