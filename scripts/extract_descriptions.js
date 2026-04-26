const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const dir = path.dirname(__dirname);
const dataPath = path.join(dir, 'Products', 'data.js');
const pdfDir = path.join(dir, 'path', 'to');

async function main() {
    let dataContent = fs.readFileSync(dataPath, 'utf8');
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
    let updatedCount = 0;

    for (const key in products) {
        const product = products[key];
        // Check if description is a placeholder
        if (product.description.includes("is a Spraytek product") || product.description.includes("is a cementitious floor screed.")) {
            if (product.catalogLink) {
                // e.g. "../path/to/Tek-Cure AR.pdf" or "path/to/Tek-Cure AR.pdf"
                const pdfName = product.catalogLink.split('/').pop();
                const pdfPath = path.join(pdfDir, decodeURIComponent(pdfName));
                
                if (fs.existsSync(pdfPath)) {
                    console.log(`Processing ${pdfName}...`);
                    try {
                        const dataBuffer = fs.readFileSync(pdfPath);
                        const pdfData = await pdf(dataBuffer);
                        let text = pdfData.text;

                        // Try to find the description
                        // Usually it's under the heading "DESCRIPTION" or "Description"
                        let desc = "";
                        const descMatch = text.match(/DESCRIPTION\s*([\s\S]*?)(?:USES|ADVANTAGES|PROPERTIES|TECHNICAL|APPLICATION|PACKAGING|COVERAGE|YIELD|CHARACTERISTICS|DIRECTIONS)/i);
                        
                        if (descMatch && descMatch[1]) {
                            desc = descMatch[1].trim();
                        } else {
                            // If no "DESCRIPTION" heading, just grab the first paragraph after the product name
                            // We can split by double newlines and find a decent sized paragraph
                            const paragraphs = text.split(/\n\s*\n/);
                            for (let p of paragraphs) {
                                p = p.trim().replace(/\n/g, ' ');
                                if (p.length > 50 && p.length < 1000 && !p.toUpperCase().includes('TECHNICAL DATA')) {
                                    desc = p;
                                    break;
                                }
                            }
                        }

                        if (desc) {
                            // Clean up the description
                            desc = desc.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
                            
                            // Truncate if too long (e.g., more than 300 characters)
                            if (desc.length > 400) {
                                desc = desc.substring(0, 400) + '...';
                            }
                            
                            if (desc.length > 20) {
                                product.description = desc;
                                updatedCount++;
                                console.log(`  Updated: ${desc.substring(0, 50)}...`);
                            } else {
                                console.log(`  Extracted description too short for ${pdfName}`);
                            }
                        } else {
                            console.log(`  Could not extract description for ${pdfName}`);
                        }

                    } catch(err) {
                        console.error(`  Error reading PDF ${pdfName}:`, err.message);
                    }
                } else {
                    console.log(`  PDF not found: ${pdfPath}`);
                }
            }
        }
    }

    if (updatedCount > 0) {
        const newDataContent = `window.productsData = ${JSON.stringify(dataObj, null, 4)};\n`;
        fs.writeFileSync(dataPath, newDataContent);
        
        // Check if Products/products.json exists and update it too just in case
        const jsonPath = path.join(dir, 'Products', 'products.json');
        if (fs.existsSync(jsonPath)) {
            fs.writeFileSync(jsonPath, JSON.stringify(dataObj, null, 4));
        }
        
        console.log(`\nSuccessfully updated ${updatedCount} descriptions in data.js!`);
    } else {
        console.log('\nNo descriptions were updated.');
    }
}

main();
