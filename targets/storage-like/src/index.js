const express = require('express');
const app = express();

// FP-25: x-amz-cf-id is CloudFront, NOT a public S3 bucket
app.get('/', (req, res) => {
  res.set({
    'x-amz-cf-id': 'E2QWRUHEXAMPLE:s3-website-us-east-1',
    'x-amz-cf-pop': 'LAX50-P3',
    'x-cache': 'Hit from cloudfront',
    'via': '1.1 abc123.cloudfront.net (CloudFront)',
    'server': 'AmazonS3',
  });
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Static Assets CDN</title></head>
<body>
<h1>Static Asset Server</h1>
<p>Content delivered via CloudFront CDN distribution.</p>
</body></html>`);
});

app.get('/assets/:file', (req, res) => {
  res.set({
    'x-amz-cf-id': 'E2QWRUHEXAMPLE:asset-' + req.params.file,
    'x-amz-cf-pop': 'LAX50-P3',
    'x-cache': 'Hit from cloudfront',
    'etag': '"a1b2c3d4e5f6"',
    'last-modified': 'Sat, 01 Sep 2024 10:00:00 GMT',
  });
  res.type('application/octet-stream').send('binary asset data');
});

// TRUE POSITIVE: Public S3-style bucket listing with sensitive files
app.get('/bucket/', (req, res) => {
  res.set({
    'x-amz-bucket-region': 'us-east-1',
    'x-amz-request-id': 'EXAMPLE12345',
    'server': 'AmazonS3',
  });
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <Name>soltrisk-internal-backups</Name>
  <Prefix></Prefix>
  <MaxKeys>1000</MaxKeys>
  <IsTruncated>false</IsTruncated>
  <Contents>
    <Key>backup.sql</Key>
    <LastModified>2024-09-15T03:00:00.000Z</LastModified>
    <ETag>&quot;d41d8cd98f00b204e9800998ecf8427e&quot;</ETag>
    <Size>52428800</Size>
    <StorageClass>STANDARD</StorageClass>
  </Contents>
  <Contents>
    <Key>credentials.env</Key>
    <LastModified>2024-09-10T14:30:00.000Z</LastModified>
    <ETag>&quot;e99a18c428cb38d5f260853678922e03&quot;</ETag>
    <Size>1024</Size>
    <StorageClass>STANDARD</StorageClass>
  </Contents>
  <Contents>
    <Key>reports/q3-2024.pdf</Key>
    <LastModified>2024-09-01T09:00:00.000Z</LastModified>
    <ETag>&quot;098f6bcd4621d373cade4e832627b4f6&quot;</ETag>
    <Size>2097152</Size>
    <StorageClass>STANDARD</StorageClass>
  </Contents>
</ListBucketResult>`);
});

app.get('/bucket/:key', (req, res) => {
  res.set({
    'x-amz-request-id': 'EXAMPLE67890',
    'server': 'AmazonS3',
  });
  res.status(403).type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<Error>
  <Code>AccessDenied</Code>
  <Message>Access Denied</Message>
  <RequestId>EXAMPLE67890</RequestId>
</Error>`);
});

app.listen(3006, '0.0.0.0', () => {
  console.log('storage-like target listening on port 3006');
});
