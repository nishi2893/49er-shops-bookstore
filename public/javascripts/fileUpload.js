

const rootStyles = window.getComputedStyle(document.documentElement)

if(rootStyles.getPropertyValue('--book-cover-width-large') != null && 
   rootStyles.getPropertyValue('--book-cover-width-large') != ''){
    ready()
} else{
    document.getElementById('main-css').addEventListener('load', ready)
}

function ready(){

    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));

    const coverHeight = coverWidth / coverAspectRatio

    FilePond.registerPlugin(
        FilePondPluginFileEncode,
        FilePondPluginImageResize,
        FilePondPluginImagePreview
    )
    
    FilePond.setOptions({
        stylePanelAspectRatio: 1 / coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    })
    // Turn all file input elements into ponds
    
    FilePond.parse(document.body);
}

//Register all the Filepond plugins which are to be used in the project

