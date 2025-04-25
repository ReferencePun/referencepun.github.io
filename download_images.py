import os
import requests
from bs4 import BeautifulSoup
import json
import re
import time
from urllib.parse import urlparse

# List of your website pages
pages = [
    "https://www.dylanforsberg.com/",
    "https://www.dylanforsberg.com/commissioned/fashion",
    "https://www.dylanforsberg.com/commissioned/accessories",
    "https://www.dylanforsberg.com/commissioned/beauty",
    "https://www.dylanforsberg.com/commissioned/misc",
    "https://www.dylanforsberg.com/landscapes/old",
    "https://www.dylanforsberg.com/landscapes/flowers",
    "https://www.dylanforsberg.com/landscapes/new",
    "https://www.dylanforsberg.com/personal/early-work",
    "https://www.dylanforsberg.com/personal/part-2",
    "https://www.dylanforsberg.com/personal/part-3",
    "https://www.dylanforsberg.com/personal/part-4",
    "https://www.dylanforsberg.com/personal/part-5",
    "https://www.dylanforsberg.com/personal/part-6",
    "https://www.dylanforsberg.com/personal/part-7",
    "https://www.dylanforsberg.com/personal/part-8",
    "https://www.dylanforsberg.com/personal/part-9"
]

downloaded_urls = set()  # Keep track of what we've already downloaded

def clean_filename(url):
    # Extract filename from URL and remove query parameters
    filename = os.path.basename(url.split('?')[0])
    # Remove any unusual characters
    filename = re.sub(r'[^\w\-.]', '_', filename)
    return filename

def create_folder_from_url(url):
    # Parse the URL path
    parsed_url = urlparse(url)
    path = parsed_url.path.strip('/')
    
    # Handle the homepage specially
    if path == "":
        folder = "images/homepage"
    else:
        folder = f"images/{path}"
    
    # Create the folder if it doesn't exist
    os.makedirs(folder, exist_ok=True)
    return folder

def download_image(img_url, folder):
    try:
        if not img_url.startswith(('http://', 'https://')):
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            else:
                img_url = 'https://www.dylanforsberg.com' + img_url
        
        # Skip if already downloaded
        if img_url in downloaded_urls:
            return
        
        filename = clean_filename(img_url)
        filepath = os.path.join(folder, filename)
        
        # Skip small thumbnails and icons (typically under 10KB)
        try:
            head_resp = requests.head(img_url, timeout=5)
            if 'content-length' in head_resp.headers:
                size = int(head_resp.headers['content-length'])
                if size < 10000:  # Skip files under 10KB
                    return
        except:
            # If head request fails, continue anyway
            pass
        
        # Download the file
        img_data = requests.get(img_url, timeout=10).content
        with open(filepath, 'wb') as f:
            f.write(img_data)
        
        downloaded_urls.add(img_url)
        print(f"Downloaded: {filename} to {folder}")
        time.sleep(0.2)  # Be polite to the server
    
    except Exception as e:
        print(f"Error downloading {img_url}: {e}")

def extract_images(soup, folder):
    # Method 1: Regular img tags
    for img in soup.find_all('img'):
        if 'src' in img.attrs:
            download_image(img['src'], folder)
        # Also check data-src which Squarespace sometimes uses
        if 'data-src' in img.attrs:
            download_image(img['data-src'], folder)
    
    # Method 2: Background images in style attributes
    for tag in soup.find_all(lambda tag: tag.has_attr('style') and 'background-image' in tag['style']):
        style = tag['style']
        matches = re.findall(r'url\([\'"]?([^\'"]+)[\'"]?\)', style)
        for match in matches:
            download_image(match, folder)
    
    # Method 3: Data attributes for lazy-loaded images
    for tag in soup.find_all(lambda tag: any(attr for attr in tag.attrs if attr.startswith('data-') and 'src' in attr)):
        for attr, value in tag.attrs.items():
            if attr.startswith('data-') and 'src' in attr and isinstance(value, str):
                download_image(value, folder)
    
    # Method 4: Look for Squarespace's JSON data which has image URLs
    for script in soup.find_all('script', type='application/json'):
        try:
            data = json.loads(script.string)
            if isinstance(data, dict):
                # Recursively search for URLs in the JSON
                def extract_urls(obj):
                    if isinstance(obj, dict):
                        for k, v in obj.items():
                            if k in ('originalSize', 'assetUrl', 'url') and isinstance(v, str) and (v.endswith('.jpg') or v.endswith('.jpeg') or v.endswith('.png')):
                                download_image(v, folder)
                            else:
                                extract_urls(v)
                    elif isinstance(obj, list):
                        for item in obj:
                            extract_urls(item)
                
                extract_urls(data)
        except:
            # Not valid JSON or other error, just continue
            pass

def scrape_page(url):
    print(f"\nScraping: {url}")
    folder = create_folder_from_url(url)
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        extract_images(soup, folder)
        
    except Exception as e:
        print(f"Error processing {url}: {e}")

# Main execution
print("Starting image download from dylanforsberg.com")
for page in pages:
    scrape_page(page)
    time.sleep(1)  # Be polite to the server

print(f"\nDownload complete! Downloaded {len(downloaded_urls)} images.")
print("Images are saved in separate folders based on their source URLs.")