# myDCIM

jeasyui
jquery
Chart.js

yum -y install cairo-devel libjpeg-turbo-devel giflib-devel
yum -y install mariadb-server mariadb 
yum -y install redis
systemctl start mariadb
systemctl enable mariadb
systemctl start redis
systemctl enable redis

cp simsun.ttc /usr/share/fonts/chinese/TrueType
cd /usr/share/fonts/chinese/TrueType
mkfontscale
mkfontdir
fc-cache -f -v
