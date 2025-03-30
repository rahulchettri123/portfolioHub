# AWS S3 Setup for Portfolio Project

## AWS IAM User Permissions
For the S3 image upload functionality to work properly, your AWS IAM user (Portfolio-website) needs the following permissions:

1. Sign in to your AWS Management Console
2. Navigate to IAM (Identity and Access Management)
3. Select Users from the left sidebar
4. Find and click on `Portfolio-website` user
5. Click "Add permissions" button
6. Choose "Attach policies directly"
7. Create a new inline policy with the following JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::portfolio-rahul123/*",
                "arn:aws:s3:::portfolio-rahul123"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListAllMyBuckets",
            "Resource": "*"
        }
    ]
}
```

8. Name the policy something like "PortfolioS3Access" and create it
9. Attach the policy to your user

## Object Ownership Setting
Your bucket's Object Ownership setting determines how you can control access to objects in your bucket:

1. Go to your S3 bucket properties
2. Look for "Object Ownership" section
3. There are three options:
   - **Bucket owner enforced** (default for new buckets): ACLs are disabled, bucket owner automatically owns all objects. You must use bucket policies for public access.
   - **Bucket owner preferred**: Bucket owner gets ownership of new objects written with the `bucket-owner-full-control` ACL.
   - **Object writer**: Original object writer owns the object.

If your bucket is set to "Bucket owner enforced" (most secure option), you cannot use ACLs. In this case, you need to:
1. Keep Object Ownership as "Bucket owner enforced" for security
2. Use the bucket policy in the next section to grant public read access to your objects
3. Make sure "Block Public Access" settings allow public policies

## S3 Bucket CORS Configuration
To allow browsers to upload directly to your S3 bucket, you need to configure CORS:

1. Go to the S3 service in AWS Management Console
2. Select your `portfolio-rahul123` bucket
3. Click on the "Permissions" tab
4. Scroll down to "Cross-origin resource sharing (CORS)"
5. Click "Edit" and paste the following configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

6. Save the changes

## Bucket Public Access Settings
If you want files to be publicly readable (for displaying on your portfolio):

1. Within your bucket settings, go to "Permissions"
2. Under "Block public access (bucket settings)", click "Edit"
3. Uncheck "Block all public access" (or specifically uncheck "Block public access to buckets and objects granted through public policies")
4. Save changes and confirm
5. Apply the bucket policy to grant public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::portfolio-rahul123/*"
        }
    ]
}
```

## Test the Setup
After applying these settings, try uploading an image from your portfolio admin section. The images should now be stored in S3 and accessible via URLs like:
```
https://portfolio-rahul123.s3.us-east-1.amazonaws.com/projects/filename.jpg
```

## Troubleshooting
If uploads still fail, check:
1. The AWS credentials in your .env file are correct
2. The bucket name in your .env file matches the actual bucket name
3. The IAM user has the correct permissions
4. The bucket CORS settings are properly configured
5. If you get "AccessControlListNotSupported" error, your bucket has Object Ownership set to "Bucket owner enforced" - make sure to use bucket policies instead of ACLs (our code now handles this automatically) 