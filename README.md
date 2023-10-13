<p align='center'>
  <img src='doc/logo.png' alt='Banner' width='128px'>
</p>

# elasticsearch-reindex-stream

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/mati365/elasticsearch-reindex-stream?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/mati365/elasticsearch-reindex-stream?style=flat-square)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

0-downtime Elasticsearch (and OpenSearch) reindex functional utility. Automatically detect ES mapping modification and reindex modified records.

## Installation

```bash
yarn install @searchpunch/elastic-reindex-stream
```

## How index synchronization works?

1. Load current mapping schema into memory
2. Check if specified index exists in ElasticSearch
   1. If not:
      1. Create new index
      2. Perform reindex of all records in storage
   2. If exists compare mappings with ElasticSearch index stored in `meta` fields as hash
      1. If equal skip reindex
      2. If differs perform full reindex

## Where it can be used?

1. Building ecommerce shops with aggregated products
2. Searching logs in dashboard
3. Autocomplete select inputs
4. ... and in many many other places

## Is it official Elasticsearch product?

No

## Icons

[Punch icons created by surang - Flaticon](https://www.flaticon.com/free-icons/punch)

## License

MIT License

Copyright (c) 2023 Mateusz Bagiński

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
