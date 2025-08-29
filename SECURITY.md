<!--
  Copyright 2025 Product Decoder
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

# Security Policy

## Version Support

We provide support for the latest minor version. Pull requests aimed at fixing security vulnerabilities in the version immediately preceding the latest will be considered. Support for versions prior to this relies entirely on community-driven pull requests.

| Version | Support Status     |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :warning:          |
| < 1.0   | :x:                |

## Patching Long-Term Support (LTS) Versions

If you rely on a previous minor version of TypeDoc and need to address security issues, kindly submit a pull request to the `staging` branch. Upon merge, your patch will automatically trigger the publication of a new version.

Ensure to update the version field in `package.json`.

Note: We only accept pull requests addressing security vulnerabilities. Additional functionalities and bug fixes for older versions are beyond the scope.

## Reporting Vulnerabilities

Kindly report vulnerabilities [here](https://github.com/WomB0ComB0/product-decoder/security/advisories/new).
