import os
import json
import re
from PyPDF2 import PdfReader

dir_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(dir_path, 'Products', 'data.js')
pdf_dir = os.path.join(dir_path, 'path', 'to')

def main():
    with open(data_path, 'r', encoding='utf-8') as f:
        data_content = f.read()
    
    json_str = data_content.replace('window.productsData = ', '').strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
        
    try:
        data_obj = json.loads(json_str)
    except Exception as e:
        print("Error parsing data.js", e)
        return

    products = data_obj.get('products', {})
    updated_count = 0

    for key, product in products.items():
        desc = product.get('description', '')
        if "is a Spraytek product" in desc or "is a cementitious floor screed" in desc:
            link = product.get('catalogLink')
            if link:
                pdf_name = link.split('/')[-1]
                # decode uri component equivalent in python
                import urllib.parse
                pdf_name = urllib.parse.unquote(pdf_name)
                pdf_path = os.path.join(pdf_dir, pdf_name)
                
                if os.path.exists(pdf_path):
                    print(f"Processing {pdf_name}...")
                    try:
                        reader = PdfReader(pdf_path)
                        text = ""
                        for i in range(min(2, len(reader.pages))): # Just check first two pages
                            text += reader.pages[i].extract_text() or ""
                            
                        # Try to find DESCRIPTION block
                        extracted_desc = ""
                        desc_match = re.search(r'DESCRIPTION\s*(.*?)(?:USES|ADVANTAGES|PROPERTIES|TECHNICAL|APPLICATION|PACKAGING|COVERAGE|YIELD|CHARACTERISTICS|DIRECTIONS)', text, re.IGNORECASE | re.DOTALL)
                        
                        if desc_match and desc_match.group(1):
                            extracted_desc = desc_match.group(1).strip()
                        else:
                            paragraphs = re.split(r'\n\s*\n', text)
                            for p in paragraphs:
                                p = p.replace('\n', ' ').strip()
                                if len(p) > 50 and len(p) < 1000 and 'TECHNICAL DATA' not in p.upper():
                                    extracted_desc = p
                                    break
                                    
                        if extracted_desc:
                            extracted_desc = re.sub(r'\s{2,}', ' ', extracted_desc).strip()
                            if len(extracted_desc) > 400:
                                extracted_desc = extracted_desc[:400] + '...'
                                
                            if len(extracted_desc) > 20:
                                product['description'] = extracted_desc
                                updated_count += 1
                                print(f"  Updated: {extracted_desc[:50]}...")
                            else:
                                print(f"  Extracted description too short for {pdf_name}")
                        else:
                            print(f"  Could not extract description for {pdf_name}")
                            
                    except Exception as e:
                        print(f"  Error reading PDF {pdf_name}: {e}")
                else:
                    print(f"  PDF not found: {pdf_path}")

    if updated_count > 0:
        new_data_content = f"window.productsData = {json.dumps(data_obj, indent=4)};\n"
        with open(data_path, 'w', encoding='utf-8') as f:
            f.write(new_data_content)
            
        json_path = os.path.join(dir_path, 'Products', 'products.json')
        if os.path.exists(json_path):
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(data_obj, indent=4))
                
        print(f"\nSuccessfully updated {updated_count} descriptions in data.js!")
    else:
        print("\nNo descriptions were updated.")

if __name__ == '__main__':
    main()
