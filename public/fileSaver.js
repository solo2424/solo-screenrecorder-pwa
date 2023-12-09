// public/fileSaver.js

export function saveAs(blob, filename) {

    console.log('Inside saveAs() function');

    console.log('Blob:', blob);
    console.log('Filename:', filename);

    console.log('Creating URL from blob...');
    const url = URL.createObjectURL(blob);
    console.log('URL:', url);

    console.log('Creating anchor element...');
    const a = document.createElement('a');

    console.log('Setting anchor properties...');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;

    console.log('Appending anchor to document...');
    document.body.appendChild(a);

    console.log('Triggering anchor click...');
    a.click();

    console.log('Removing anchor after timeout...');
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('Anchor removed!');
    }, 0);

    console.log('Dispatching click event on anchor...');
    const clickEvent = new MouseEvent('click');
    a.dispatchEvent(clickEvent);

    console.log('saveAs() complete!');

}