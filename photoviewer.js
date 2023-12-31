import { S3 } from "aws-sdk";
const BUCKET_NAME = BUCKET_NAME_;
const REGION = REGION_;
var albumBucketName = albumBucketName_;
var cloudfront_url = cloudfront_url_;
var IdentityPoolId=IdentityPoolId_;
// **DO THIS**:
//   Replace this block of code with the sample code located at:
//   Cognito -- Manage Identity Pools -- [identity_pool_name] -- Sample Code -- JavaScript
//
// Initialize the Amazon Cognito credentials provider
AWS.config.region = REGION; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: IdentityPoolId,
});

// Create a new service object
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket: BUCKET_NAME }
});

class Photoviewer {
  constructor() {
 

    const modalContent = `
<!-- HTML content of modal -->
 <div id="myModal" class="modal">
  <div id="viewer" > </div> <div class="modal-content"> <div class="hdr">  <h1>File Manager</h1> <button class="bck_to_albums"> Back To Albums </button> <div class="upload_"> <input id="photoupload" type="file" accept="image/*"> <button class="addphoto" id="addphoto" > Add Photo </button></div> <div class="search-icon"> <input type="search" id="search_" class="search_"> <button> <img class="search_icon" src="aws_customfilemanager/serachicon.png" > </button> </div> </div> <div id="app_head" > </div> <div id="app" ><p> No Files found </p></div> <button class="close-button">X</button> </div> </div>
`;
    // ... your Modal class implementation
    // Create a container element
    this.container = document.createElement('div');
    this.container.innerHTML = modalContent;

    // Append the container to the body
    document.body.appendChild(this.container);

    // Get the modal element
    this.modalElement = document.querySelector('#myModal');

    // Add event listener to close button
    const closeButton = this.modalElement.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      hide();
    });

  
    document.addEventListener('click', function(event) {
      if (event.target.matches('.file_mg_c')) {
        listAlbums();
        viewAlbum("/");
        show();
      }
      if (event.target.matches('.va_btn')) {
        let album= event.target.getAttribute('data-id');
        event.target.classList.add("selected");
        viewAlbum(album);
      }

      if (event.target.matches('.subfolder')) {
        let sub_album= event.target.getAttribute('data-id');
        viewsubAlbum(sub_album);
      }

        if (event.target.matches('.image_name')) {
          enableRename.call(null, event.target); // Set "this" to the clicked element
        }

        if (event.target.matches('.addphoto')) {
          
          let albumName_ = document.querySelector('.album_name_').value;
          console.log(albumName_);
      
          addPhoto.call(null,  albumName_ ); // Set "this" to the clicked element
          
        }

        if (event.target.matches('.cros_delete')) {
          
          let albumName_ = document.querySelector('.album_name_').value;
          console.log(albumName_);
         let photoKey_= event.target.getAttribute('data-id');
          deletePhoto.call(null,  albumName_ ,photoKey_);   // Set "this" to the clicked element
          
        }
        if (event.target.matches('.bck_to_albums')) {
          let albumName_ = document.querySelector('.album_name_').value;
          // const regex = /\/[^\/]*$/; // Matches the last element after a backslash
          const regex =/\/[^\/]*\/[^\/]*$/;
          let resultString = albumName_.replace(regex, '');
          console.log(resultString);

          if(resultString==albumName_.replace("/",""))
          {
            resultString="/";
          }
          viewAlbum(resultString);   // Set "this" to the clicked element
          
        }

        if (event.target.matches('.search_icon')) {
         let seach_bx= document.querySelector('.search_').value;
          
          searchImages.call(null,seach_bx);   // Set "this" to the clicked element
          
        }
        if (event.target.matches('.search_')) {
         let seach_bx= document.querySelector('.search_').value;
          
         
          searchImages.call(null,seach_bx);   // Set "this" to the clicked element
          
        }
        if (event.target.matches('.fl_img')) {
          if (event.target.matches('.subfolder')) {
            let sub_album= event.target.getAttribute('data-id');
            viewsubAlbum(sub_album);
          }
else {
  let image_path= event.target.getAttribute('src');
  document.querySelector('.file_mg_img').src=image_path;
  hide();
  console.log(image_path);
}    
         
          //  searchImages.call(null,seach_bx);   // Set "this" to the clicked element
           
         }
        
    });
 

  }

}

  // ... other methods of the Modal class

  // A utility function to create HTML.
  function getHtml (template){
    return template.join('\n');
  }





  function show(){
    document.querySelector('#myModal').style.display = 'flex';
  }

  function hide(){
    document.querySelector('#myModal').style.display = 'none';
  }


  // List the photo albums that exist in the bucket.
  function listAlbums() {
    s3.listObjects({ Delimiter: '/' }, function (err, data) {
      if (err) {
        return alert('There was an error listing your albums: ' + err.message);
      } else {
        var albums = data.CommonPrefixes.map(function (commonPrefix) {
          var prefix = commonPrefix.Prefix;
          var albumName = decodeURIComponent(prefix.replace('/', ''));
          return getHtml([
            '<li class="va_btn" data-id="'+albumName+'">',
            '<img class="va_btn" data-id="'+albumName+'" src="aws_customfilemanager/folder_icon.png"/> ',
            '<span class="va_btn" data-id="'+albumName+'" >',
            albumName,
            '</span>',
            '</li>'
          ]);
        });
        var message = albums.length ?
        getHtml([
            '<p>Click on an album name to view it.</p>',
          ]) :
          '<p>You do not have any albums. Please Create album.';
        var htmlTemplate = [
          '<h2>Albums</h2>',
          message,
          '<ul>',
          getHtml(albums),
          '</ul>',
        ]
        document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
      }
    });
   
  }
  function createAlbum (albumName)  {
    albumName = albumName.trim();
    if (!albumName) {
      return alert("Album names must contain at least one non-space character.");
    }
    if (albumName.indexOf("/") !== -1) {
      return alert("Album names cannot contain slashes.");
    }
    var albumKey = encodeURIComponent(albumName);
    s3.headObject({ Key: albumKey }, function (err, data) {
      if (!err) {
        return alert("Album already exists.");
      }
      if (err.code !== "NotFound") {
        return alert("There was an error creating your album: " + err.message);
      }
      s3.putObject({ Key: albumKey }, function (err, data) {
        if (err) {
          return alert("There was an error creating your album: " + err.message);
        }
        alert("Successfully created album.");
        viewAlbum(albumName);
      });
    });
  }
 
  function enableRename(target) {
    const imageNameSpan = target;
  
    // Replace the span with an input field
    const inputField = document.createElement('input');
    inputField.type = 'text';
    let prev_text = imageNameSpan.innerText;
    inputField.value = prev_text;
    inputField.addEventListener('blur', () => saveRename(prev_text, inputField)); // Fix the event listener
    imageNameSpan.replaceWith(inputField);
  }

  function saveRename(prev_text, inputField) {
    const imageNameInput = inputField;
    console.log("SAVE RENAME: " + imageNameInput.value);
  
    // Replace the input field with the span containing the new image name
    const renameSpan = document.createElement('span');
    renameSpan.className = 'image_name'; // Use className instead of class
    renameSpan.innerText = imageNameInput.value;
    imageNameInput.replaceWith(renameSpan);

    let albumName_ = document.querySelector('.album_name_').value;

    renameS3Image(BUCKET_NAME+'/'+albumName_,prev_text,imageNameInput.value);

  }

  
  function addPhoto(albumName) {
    var files = document.getElementById("photoupload").files;
    if (!files.length) {
      return alert("Please choose a file to upload first.");
    }
    var file = files[0];
    var fileName = file.name;
    // var albumPhotosKey = encodeURIComponent(albumName) + "/";
    var albumPhotosKey = albumName;
    var photoKey = albumPhotosKey + fileName;

    var bucket = new AWS.S3({ params: { Bucket: albumBucketName } });


    var params = {
      Bucket: albumBucketName,
      Key: photoKey,
      Body: file,
      Expires: 300,
      ContentType: file.type

    };

    // bucket.upload(params, function (err, data) {
    //  console.log(err ? 'ERROR!'+err : 'UPLOADED.');
    // });
    var upload = new AWS.S3.ManagedUpload({
      params: params
    });

    try {
      var promise = upload.promise();
      promise.then(
        function (data) {
          console.log("Successfully uploaded photo.");
          viewAlbum(albumName);
        },
        function (err) {
          return alert("There was an error uploading your photo: ", err.message);
        }
      );
    } catch (error) {
      console.error("Error during image upload:", error);
      // Handle the error and display an appropriate message to the user
      alert("Error during image upload: " + error.message);
    }

  }

  function deletePhoto(albumName, photoKey) {
    var confirmation = confirm("Are you sure you want to delete " + photoKey + " photo?");

    // If user confirms the deletion
    if (confirmation) {
      s3.deleteObject({ Key: photoKey }, function (err, data) {
        if (err) {
          return alert("There was an error deleting your photo: ", err.message);
        }
        alert("Successfully deleted photo.");
        viewAlbum(albumName);
      });
    }
  }

  function deleteAlbum (albumName) {
    var albumKey = encodeURIComponent(albumName) + "/";
    s3.listObjects({ Prefix: albumKey }, function (err, data) {
      if (err) {
        return alert("There was an error deleting your album: ", err.message);
      }
      var objects = data.Contents.map(function (object) {
        return { Key: object.Key };
      });
      s3.deleteObjects(
        {
          Delete: { Objects: objects, Quiet: true }
        },
        function (err, data) {
          if (err) {
            return alert("There was an error deleting your album: ", err.message);
          }
          alert("Successfully deleted album.");
          this.listAlbums();
        }
      );
    });
  }

  function viewAlbum(albumName){
    var albumPhotosKey = encodeURIComponent(albumName) + "/";
    s3.listObjects({ Prefix: albumPhotosKey, Delimiter: '/' }, function (err, data) {
      if (err) {
        return alert("There was an error viewing your album: " + err.message);
      }
  
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + albumBucketName + "/";
  
      var count_ = 1;
      var items = data.CommonPrefixes.concat(data.Contents); // Combine folders and objects
  
      var galleryItems = items.map(function (item) {
        var itemKey = item.Prefix || item.Key; // Use Prefix for folders, Key for objects
        var itemUrl = cloudfront_url + '/' + itemKey;
        var html_div = '';
        
        if (!item.Prefix) {
          // Item is an object (image)
          count_ += 1;
          return getHtml([
            html_div + "<div class='img_div' data-id='"+itemKey+"' > ",
            "<span style='cursor: pointer;' class='cros_delete' data-id='"+itemKey+"' \">",
            "X",
            "</span>",
            "<div>",
            '<img class="fl_img" src="' + itemUrl + '"/> ',
            "</div>",
            "<div >",
            "<span class='image_name' '>",
            itemKey.replace(albumPhotosKey, ""),
            "</span>",
            "</div>",
            "</div>"
          ]);
        } else {
          // Item is a folder (subfolder)
          return getHtml([
            html_div + "<div class='img_div ' > ",
            "<span style='cursor: pointer;' class='cros_delete' data-id='"+itemKey+"' \">",
            "X",
            "</span>",
            "<div>",
            '<img class="fl_img subfolder"  data-id="'+itemKey+'" src="aws_customfilemanager/folder_icon.png"/> ',
            "</div>",
            "<div >",
            "<span class='image_name' '>",
            itemKey.replace(albumPhotosKey, ""),
            "</span>",
            "</div>",
            "</div>"
          ]);
        }
      });
  
      var message = galleryItems.length
        ? "<p>Click on the X to delete the item</p>"
        : "<p>This album is empty. Please add items.</p>";
      var htmlTemplate = [
        message,
        "<div><div class='row'>",
        getHtml(galleryItems),
        "</div></div>"
      ];
  
      var albumHead = "<h2> Album: " + albumName + "</h2><input type='hidden' value='"+albumName+"' class='album_name_'></input>";
      document.getElementById("app_head").innerHTML = albumHead;
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    });
  }
  
  function viewsubAlbum(albumName){
    console.log('Viewing album:', albumName); // Debugging
    var albumPhotosKey = encodeURIComponent(albumName) + "/";
    
    s3.listObjects({ Prefix: albumName }, function (err, data) {
      if (err) {
        console.error('Error viewing album:', err); // Debugging
        return alert("There was an error viewing your album: " + err.message);
      }
  
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + albumBucketName + "/";
  
      var count_ = 1;
      var items = data.CommonPrefixes.concat(data.Contents); // Combine folders and objects
  
      var galleryItems = items.map(function (item) {
        var itemKey = item.Prefix || item.Key; // Use Prefix for folders, Key for objects
        var itemUrl = cloudfront_url + '/' + itemKey;
        var html_div = '';
        
        if (!item.Prefix) {
          // Item is an object (image)
          count_ += 1;
          return getHtml([
            html_div + "<div class='img_div' data-id='"+itemKey+"' > ",
            "<span style='cursor: pointer;' class='cros_delete' data-id='"+itemKey+"' \">",
            "X",
            "</span>",
            "<div>",
            '<img class="fl_img" src="' + itemUrl + '"/> ',
            "</div>",
            "<div >",
            "<span class='image_name' '>",
            itemKey.replace(albumPhotosKey, ""),
            "</span>",
            "</div>",
            "</div>"
          ]);
        } else {
          // Item is a folder (subfolder)
          return getHtml([
            html_div + "<div class='img_div ' > ",
            "<span style='cursor: pointer;' class='cros_delete' data-id='"+itemKey+"' \">",
            "X",
            "</span>",
            "<div>",
            '<img class="fl_img subfolder"  data-id="'+itemKey+'" src="aws_customfilemanager/folder_icon.png"/> ',
            "</div>",
            "<div >",
            "<span class='image_name' '>",
            itemKey.replace(albumPhotosKey, ""),
            "</span>",
            "</div>",
            "</div>"
          ]);
        }
      });
  
      var message = galleryItems.length
        ? "<p>Click on the X to delete the item</p>"
        : "<p>This album is empty. Please add items.</p>";
      var htmlTemplate = [
        message,
        "<div><div class='row'>",
        getHtml(galleryItems),
        "</div></div>"
      ];
  
      var albumHead = "<h2> Album: " + albumName + "</h2><input type='hidden' value='"+albumName+"' class='album_name_'></input>";
      document.getElementById("app_head").innerHTML = albumHead;
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    });
  }


  async function searchImages(search) {
    try {

      var imgDivsWithDataId = document.querySelectorAll(".img_div[data-id]");

      // Loop through each div element and check if it contains the searchTerm
      imgDivsWithDataId.forEach(function (div) {
        var divText = div.textContent || div.innerText; // Handle different browser compatibility
        var dataId = div.getAttribute("data-id").trim().split('/');
          dataId=dataId[dataId.length - 1].toLowerCase();
          
          if (dataId.includes(search)) {
            div.style.display = "block"; // Show relevant divs
          } else {
            div.style.display = "none"; // Hide irrelevant divs
          }
     
      });
  
     

      
    // Filter image keys based on the queryImageNames array
 



    } catch (error) {
      console.error('Error:', error);
    }
  }

  function renameS3Image(BUCKET_NAME,IMAGE_KEY,NEW_IMAGE_KEY)
  {
    // Retrieve the image object from the S3 bucket
s3.getObject({ Bucket: BUCKET_NAME, Key: IMAGE_KEY }, (err, data) => {
  if (err) {
    console.error('Error retrieving image:', err);
    return;
  }

  // Copy the image object to a new key (new name)
  s3.copyObject({ Bucket: BUCKET_NAME, CopySource: `${BUCKET_NAME}/${IMAGE_KEY}`, Key: NEW_IMAGE_KEY }, (err, data) => {
    if (err) {
      console.error('Error renaming image:', err);
      return;
    }

    console.log('Image renamed successfully');

    // Optionally, delete the old image object
    s3.deleteObject({ Bucket: BUCKET_NAME, Key: IMAGE_KEY }, (err, data) => {
      if (err) {
        console.error('Error deleting old image:', err);
        return;
      }

      console.log('Old image deleted successfully');
    });
  });
});
  }


export default Photoviewer;


