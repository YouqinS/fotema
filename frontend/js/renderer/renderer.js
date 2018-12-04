
const showImages = (images) => {
    console.log('showing images???');
    images.forEach(image=>{

     document.getElementById('uploadfile').style.display = 'none';

        const myMedia = document.querySelector('#myMedia');
        myMedia.innerHTML =

        `<div class="responsive">
          <div class="gallery">
            <a  target="_blank" href="uploads/${image.original}">
            <img src='thumbs/${image.thumbnail}'>
            </a>
            <div class="desc">
                <p class="description">description</p>
                <p class="likes"><i class="fa fa-heart"></i> ${image.likes}</p>
                <p class="comments"><i class="fa fa-commenting">${image.comments}</i></p>
            </div>
          </div>
        </div>` + myMedia.innerHTML;

    });

    console.log('showing images OK???');
};

//show search results on front end
const showSearchResults = (images) => {
  console.log('showing showSearchResults ???');
  images.forEach(image=>{

    document.getElementById('showSearchResults').style.display = 'block';
    document.getElementById('showSearchResults').style.visibility = 'visible';


    const myMedia = document.querySelector('#showSearchResults');
    myMedia.innerHTML =

        `<div class="responsive">
          <div class="gallery">
            <a  target="_blank" href="uploads/${image.original}">
            <img src='thumbs/${image.thumbnail}'>
            </a>
            <div class="desc">
                <p class="description">description</p>
                <p class="likes"><i class="fa fa-heart"></i> ${image.likes}</p>
                <p class="comments"><i class="fa fa-commenting">${image.comments}</i></p>
            </div>
          </div>
        </div>` + myMedia.innerHTML;

  });

  console.log('showing showSearchResults OK???');
};

module.exports ={
    showImages:showImages(),
    showSearchResults:showSearchResults(),
}

