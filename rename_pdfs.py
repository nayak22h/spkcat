import os
import json
import re

dir_path = 'c:/Users/nayak/Downloads/SpraytekWebsite/spkcat'
pdf_dir = os.path.join(dir_path, 'path', 'to')
data_path = os.path.join(dir_path, 'Products', 'data.js')
json_path = os.path.join(dir_path, 'Products', 'products.json')

def main():
    # 1. Rename files in the directory
    renamed_files_map = {} # map old name to new name
    print(f"Checking PDFs in {pdf_dir}...")
    
    for filename in os.listdir(pdf_dir):
        if ' ' in filename:
            # Replace spaces with hyphens
            # Also replace multiple hyphens with a single hyphen just in case
            new_filename = re.sub(r'\s+', '-', filename)
            new_filename = re.sub(r'-+', '-', new_filename)
            
            old_path = os.path.join(pdf_dir, filename)
            new_path = os.path.join(pdf_dir, new_filename)
            
            try:
                os.rename(old_path, new_path)
                renamed_files_map[filename] = new_filename
                print(f"Renamed: '{filename}' -> '{new_filename}'")
            except Exception as e:
                print(f"Failed to rename '{filename}': {e}")
        elif '%20' in filename:
            # Just in case there are URL-encoded spaces
            new_filename = filename.replace('%20', '-')
            new_filename = re.sub(r'-+', '-', new_filename)
            old_path = os.path.join(pdf_dir, filename)
            new_path = os.path.join(pdf_dir, new_filename)
            try:
                os.rename(old_path, new_path)
                renamed_files_map[filename] = new_filename
                print(f"Renamed: '{filename}' -> '{new_filename}'")
            except Exception as e:
                print(f"Failed to rename '{filename}': {e}")
                
    # 2. Update data.js and products.json
    print("\nReading data.js...")
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
    updated_links = 0

    for key, product in products.items():
        link = product.get('catalogLink')
        if link:
            # Check if link contains spaces or %20
            # Also apply the exact renaming logic we used for files
            filename = link.split('/')[-1]
            # Convert URL encoded space back to normal space to match file name
            decoded_filename = filename.replace('%20', ' ')
            
            if decoded_filename in renamed_files_map:
                new_filename = renamed_files_map[decoded_filename]
                new_link = link.replace(filename, new_filename)
                product['catalogLink'] = new_link
                updated_links += 1
                
            elif ' ' in filename or '%20' in filename:
                # If it has spaces but wasn't in our rename map (maybe file didn't exist)
                # We should still update the link for consistency
                new_filename = filename.replace('%20', ' ')
                new_filename = re.sub(r'\s+', '-', new_filename)
                new_filename = re.sub(r'-+', '-', new_filename)
                new_link = link.replace(filename, new_filename)
                product['catalogLink'] = new_link
                updated_links += 1

    if updated_links > 0 or len(renamed_files_map) > 0:
        new_data_content = f"window.productsData = {json.dumps(data_obj, indent=4)};\n"
        with open(data_path, 'w', encoding='utf-8') as f:
            f.write(new_data_content)
            
        if os.path.exists(json_path):
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(data_obj, indent=4))
                
        print(f"\nSuccessfully updated {updated_links} catalog links in data.js and products.json!")
    else:
        print("\nNo files or links needed updating.")

if __name__ == '__main__':
    main()
