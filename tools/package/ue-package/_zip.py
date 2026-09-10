import zipfile,os
out="/workspace/current/tools/package/agco-index-header-footer-1.6.zip"
if os.path.exists(out): os.remove(out)
z=zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED)
for root,_,files in os.walk('.'):
    for f in files:
        if f=='_zip.py': continue
        p=os.path.join(root,f)
        z.write(p, os.path.relpath(p,'.'))
z.close()
