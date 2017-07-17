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

npm install pm2 -g

GRANT ALL PRIVILEGES ON *.* TO 'root'@'%'IDENTIFIED BY 'wangDY123' WITH GRANT OPTION; 
flush privileges;

pm2 start index.js -i 0 --name "DCIM"