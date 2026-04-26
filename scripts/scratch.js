const fs = require('fs');
const path = require('path');

const dir = path.dirname(__dirname);
const indexPath = path.join(dir, 'index.html');
const dataPath = path.join(dir, 'Products', 'data.js');

// 1. Read and parse data.js
let dataContent = fs.readFileSync(dataPath, 'utf8');
// It starts with window.productsData = { ... };
let jsonStr = dataContent.replace('window.productsData = ', '').trim();
if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
let dataObj;
try {
    dataObj = JSON.parse(jsonStr);
} catch(e) {
    console.error("Error parsing data.js", e);
    process.exit(1);
}

const products = dataObj.products;

// Find max product ID
let maxId = 0;
for (const key in products) {
    if (key.startsWith('product')) {
        const num = parseInt(key.replace('product', ''), 10);
        if (num > maxId) maxId = num;
    }
}

// Map existing product names to their IDs for easy lookup
const nameToId = {};
for (const key in products) {
    nameToId[products[key].name.toLowerCase().trim()] = key;
}

// 2. Read and parse index.html
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Regex to find all links inside category sections
// We'll look for <a href="...">Name</a>
// but we want to ignore commented out ones.
// It's easier to process line by line or with a regex that ignores comments.
const noComments = indexContent.replace(/<!--[\s\S]*?-->/g, '');

const linkRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
let match;
let newProductsAdded = 0;

let newIndexContent = indexContent;

while ((match = linkRegex.exec(noComments)) !== null) {
    const href = match[1];
    let name = match[2].trim();
    if (!name) continue;

    // Ignore links that aren't products (e.g. contact.html, index.html)
    if (href.includes('contact.html') || href.includes('index.html') && !href.includes('prod.html')) continue;

    // If it's already a product link, we ensure it's in our map
    if (href.includes('prod.html?product=')) {
        const prodId = href.split('product=')[1];
        if (!products[prodId]) {
            products[prodId] = {
                name: name,
                description: name + " is a Spraytek product.",
                images: [],
                catalogLink: `../path/to/${name}.pdf` // Guessing
            };
            nameToId[name.toLowerCase()] = prodId;
            newProductsAdded++;
        }
        continue;
    }

    // It's a PDF link or something else
    // Let's check if we already have it by name
    let existingId = nameToId[name.toLowerCase()];

    if (!existingId) {
        maxId++;
        existingId = `product${maxId}`;
        
        products[existingId] = {
            name: name,
            description: name + " is a Spraytek product.",
            images: [],
            catalogLink: href.startsWith('path/to') ? `../${href}` : href
        };
        nameToId[name.toLowerCase()] = existingId;
        newProductsAdded++;
    }

    // Update index.html to point to this new ID
    // We have to be careful with global replace to not mess up other things
    // Let's replace exactly this tag
    const originalTag = match[0];
    const newTag = `<a href="Products/prod.html?product=${existingId}">${name}</a>`;
    
    // We only replace if the original href wasn't already a prod link
    if (!href.includes('prod.html?product=')) {
        // Need to do this carefully on the original indexContent
        // to avoid replacing commented out stuff accidentally, 
        // we can do a split/join or replace
        newIndexContent = newIndexContent.replace(originalTag, newTag);
    }
}

// 3. Write back data.js
const newDataContent = `window.productsData = ${JSON.stringify(dataObj, null, 4)};\n`;
fs.writeFileSync(dataPath, newDataContent);

// 4. Write back index.html
fs.writeFileSync(indexPath, newIndexContent);

console.log(`Added ${newProductsAdded} missing products to data.js`);
console.log('Updated index.html to link to all product pages');
