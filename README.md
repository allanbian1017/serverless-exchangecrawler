# ExchangeCrawler

## Architecture
![Architecture](./images/Architecture.png)
## Usage
Install all dependency library:
```
npm install
```
Run unit test:
```
npm test
```
Setup LINE access token/secret key:
```
aws ssm put-parameter --type=String --name /exchangecrawler/LINE_ACCESSTOKEN --value **YOUR ACCESS TOKEN**
aws ssm put-parameter --type=String --name /exchangecrawler/LINE_SECRET --value **YOUR SECRET**
```
Deploy ExchangeCrawler service to AWS:
```
sls deploy
```