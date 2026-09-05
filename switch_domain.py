"""
Domain Switcher Utility for Barkat Packaging Website
----------------------------------------------------
Usage:
    python switch_domain.py <new_domain>

Example:
    python switch_domain.py barkatpackaging.pk
    python switch_domain.py barkatpackaging.com
"""

import sys
import os
import re

OLD_BASE_URL = "https://jibranpcccc.github.io/barkat-packaging-website/"

def main():
    if len(sys.argv) < 2:
        print("Error: Missing target domain name.")
        print("Usage: python switch_domain.py <your-domain.pk/com>")
        sys.exit(1)

    domain = sys.argv[1].strip().lower()
    domain = re.sub(r"^https?://", "", domain).rstrip("/")

    if not re.match(r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", domain):
        print(f"Error: '{domain}' does not appear to be a valid domain name.")
        sys.exit(1)

    new_base_url = f"https://{domain}/"
    repo_dir = os.path.dirname(os.path.abspath(__file__))

    target_files = [
        "index.html",
        "about.html",
        "products.html",
        "agro-packaging.html",
        "calculator.html",
        "contact.html",
        "sitemap.xml",
        "robots.txt",
        "llms.txt",
        "_redirects",
    ]

    print(f"\n========================================================")
    print(f"  Switching Website Domain to: {domain}")
    print(f"  Old Base URL: {OLD_BASE_URL}")
    print(f"  New Base URL: {new_base_url}")
    print(f"========================================================\n")

    modified_count = 0
    for filename in target_files:
        filepath = os.path.join(repo_dir, filename)
        if not os.path.exists(filepath):
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        occurrences = content.count(OLD_BASE_URL)
        if occurrences > 0:
            updated_content = content.replace(OLD_BASE_URL, new_base_url)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(updated_content)
            print(f"[OK] {filename}: Replaced {occurrences} occurrence(s)")
            modified_count += 1
        else:
            print(f"[-] {filename}: No occurrences found")

    # Create CNAME file for GitHub Pages
    cname_path = os.path.join(repo_dir, "CNAME")
    with open(cname_path, "w", encoding="utf-8") as f:
        f.write(f"{domain}\n")
    print(f"[OK] CNAME file created with content: '{domain}'")

    print(f"\nSuccessfully migrated {modified_count} file(s) and configured CNAME!")
    print(f"\nNext Steps:")
    print(f"1. In your domain registrar (e.g. PKNIC, GoDaddy, Namecheap), add these A Records:")
    print(f"   185.199.108.153")
    print(f"   185.199.109.153")
    print(f"   185.199.110.153")
    print(f"   185.199.111.153")
    print(f"2. Commit and push changes:")
    print(f"   git add . ; git commit -m 'feat: switch domain to {domain}' ; git push origin main")
    print(f"3. In GitHub Repository Settings -> Pages -> Custom Domain, verify HTTPS is active.")

if __name__ == "__main__":
    main()
