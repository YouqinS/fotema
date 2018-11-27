
//show image after user has chosen one, before uploading
const readURL = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            $('#newImage')
                .attr('src', e.target.result)
                .width(300)
                .height(auto);
        };

        reader.readAsDataURL(input.files[0]);
    }
};