# ExchangeCrawler

[![pipeline status](https://gitlab.com/AI003TeamWork/CloudProject/ExchangeCrawler/badges/master/pipeline.svg)](https://gitlab.com/AI003TeamWork/CloudProject/ExchangeCrawler/commits/master)
[![coverage report](https://gitlab.com/AI003TeamWork/CloudProject/ExchangeCrawler/badges/master/coverage.svg)](https://gitlab.com/AI003TeamWork/CloudProject/ExchangeCrawler/commits/master)

## Architecture

![Architecture](./images/Architecture.png)

## Usage

Install all dependency library:

```bash
npm install
```

Run unit test:

```bash
npm test
```

Setup LINE access token/secret key:

```bash
aws ssm put-parameter --type=String --name /exchangecrawler/LINE_ACCESSTOKEN --value **YOUR ACCESS TOKEN**
aws ssm put-parameter --type=String --name /exchangecrawler/LINE_SECRET --value **YOUR SECRET**
```

Setup Datadog api key:

```bash
aws ssm put-parameter --type=String --name /exchangecrawler/DATADOG_API_KEY --value **YOUR API KEY**
```

Setup Google Cloud crendential for BigQuery:

```bash
aws ssm put-parameter --type=String --name /exchangecrawler/GCP_PROJECT_ID --value **YOUR PROJECT ID**
aws ssm put-parameter --type=String --name /exchangecrawler/GCP_CLIENT_EMAIL --value **YOUR CLIENT EMAIL**
aws ssm put-parameter --type=String --name /exchangecrawler/GCP_PRIVATE_KEY --value **YOUR PRIVATE KEY**
```

Deploy ExchangeCrawler service to AWS:

```bash
sls deploy
```
