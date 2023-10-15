# searchpunch 👊

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/mati365/searchpunch?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/mati365/searchpunch?style=flat-square)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

<img src='doc/logo.png' alt='Banner' width='220px' align="right" >

Tired of writing elasticsearch reindexing scripts? Are you constantly encountering data synchronization problems between the database and elasticsearch? Are you crying about the lack of namespaces in the organization of indexes in your cluster? Nothing lost! Here is **searchpunch** and punch this shit out!

## What does it offer? ⭐

1.  0-downtime reindexing
2.  automatic removing unused indices based on IaC namespace definition ♻
3.  synchronization of data between any database using async generators 
4.  automatic detection of index settings / mappings modification and reindex modified inndices
5.  bulk reindex of records
6.  group indices into namespaces 
8.  fully typed error handling using Either error handling

## Installation 🚀

```bash
yarn add @searchpunch/reindex
```

## How index synchronization works? 🛠️  

1. Load current mapping schema into memory
2. Check if specified index exists in ElasticSearch
   1. If not:
      1. Create new index
      2. Perform reindex of all records in storage
   2. If exists compare mappings with ElasticSearch index stored in `meta` fields as hash
      1. If equal skip reindex
      2. If differs perform full reindex

## Where it can be used? 🏗️

1. Building ecommerce shops with aggregated products
2. Searching logs in dashboard
3. Autocomplete select inputs
4. ... and in many many other places

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
