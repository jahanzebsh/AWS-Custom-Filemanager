# AWS S3 Custom File Manager Package

The AWS S3 Custom File Manager Package allows you to easily manage files and images stored in an Amazon S3 bucket. You can integrate this package into your Laravel and Node.js Express applications to provide efficient file management capabilities.

## Installation

1. Install the package using npm:





   npm install aws-s3-custom-file-manager


Initialize the AWS S3 Client and configure the FileManager:


import FileManager from "aws-s3-file-manager";
const BUCKET_NAME_ = 'xxx';
const REGION_ = 'xxxx';
var albumBucketName_ = BUCKET_NAME_;
var cloudfront_url_ = 'xxxx';
var IdentityPoolId_='xxxx';

   Include the necessary JavaScript and CSS files in your HTML:


  <script src="aws_customfilemanager/dist/modal.bundle.js"></script>
<link rel="stylesheet" href="aws_customfilemanager/dist/styles.css">

Add an HTML element to your page to trigger the file manager:


# <img class="file_mg_img" src="https://zxczczc/xczcxzc-zxczxc-Food-Side.png">
# <a href="javascript:void(0);" class="file_mg_c">Click To Change Image</a>


Contributing
Contributions to this package are welcome. If you find any issues or have suggestions for improvements, please create a pull request or open an issue on the GitHub repository.

License
This package is licensed under the MIT License. See the LICENSE file for details.