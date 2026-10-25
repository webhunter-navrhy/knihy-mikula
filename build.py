# Statický e-shop (zdroj: site/), build = kopie do dist/
import shutil,os
h=os.path.dirname(os.path.abspath(__file__))
d=os.path.join(h,"dist")
shutil.rmtree(d,ignore_errors=True)
shutil.copytree(os.path.join(h,"site"),d)
