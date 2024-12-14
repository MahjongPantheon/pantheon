# Pantheon installation steps on clean VPS

Steps described here were executed during last moving of Pantheon main instance from one server to another. New server
was running clean Debian 12 Bookworm. Note that if you run different distro, package names and package installation
commands must be adjusted accordingly.

### Prerequisites

- The service provider stated that port 25 was not blocked in any way, so nothing should prevent the system from
  sending emails.
- Server IP was not included in any blocklists and spamlists.
- The hostname of main instance is riichimahjong.org, so the TLD is more or less trusted. Note that less popular TLDs
  can be the reason of issues during sending emails (check with TLD status if required).

I'll use vim as editor of choice, you can use nano or any other editor as well.

### Initial configuration of the host

All following commands are run as root.

```bash
apt update
apt upgrade
apt install htop vim iptables mailutils make apache2-utils

# change port to some other to prevent malicious ssh login attempts:
vi /etc/ssh/sshd_config # edit port here
systemctl reload sshd

# here select all locales you want to have in your system
dpkg-reconfigure locales
 
# here select "internet site; mail is sent and received directly using SMTP"
dpkg-reconfigure exim4-config

# test sending email, enter address to send email to, enter some test text, and then press Ctrl-D to send the email.
mail -s 'TEST'

# Check logs in a while for email status. It should be sent (maybe with a warning)
cat /var/log/exim4/mainlog

# Install docker engine:
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
apt-get install ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
     $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Check that docker is set up correctly
docker run hello-world

# Enable autostart of docker services
systemctl enable docker.service
systemctl enable containerd.service

# Add a local user so you won't need to login as root (good practice in general)    

adduser YOUR_USERNAME
usermod -aG docker YOUR_USERNAME
usermod -aG sudo YOUR_USERNAME
```

After the user is created and added to these groups, you may log in with this user and use docker commands as well as
`sudo` command.

### Setting up local users and pantheon folder

All following commands are run from the user account (all `sudo` commands can be run as root as well).

```bash
# zsh is optional, if you want a better shell :)
sudo apt install nginx certbot zsh
# install zsh goodies (also optional)
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# add separate non-root user for certificates handling
sudo adduser certbotrunner
sudo mkdir /home/certbotrunner/letsencrypt/
sudo chown -R certbotrunner /home/certbotrunner/letsencrypt/

# Make a folder for pantheon and clone the repo there
sudo mkdir -p /srv/__pantheon
sudo chown YOUR_USERNAME /srv/__pantheon
cd /srv/__pantheon
git clone https://github.com/MahjongPantheon/pantheon.git . # note the trailing dot

# Create directories for letsencrypt bot
sudo mkdir /srv/__pantheon/Bragi-dist/.well-known
sudo mkdir /srv/__pantheon/Tyr-dist/.well-known
sudo mkdir /srv/__pantheon/Forseti-dist/.well-known
sudo mkdir /srv/__pantheon/Sigrun-dist/.well-known
sudo mkdir /srv/__pantheon/Gullveig/www/.well-known
sudo mkdir /srv/__pantheon/Mimir/www/.well-known
sudo mkdir /srv/__pantheon/Frey/www/.well-known
sudo mkdir /srv/__pantheon/Hugin/www/.well-known

# Assign proper owner to created directories
sudo chown certbotrunner /srv/__pantheon/Bragi-dist/.well-known
sudo chown certbotrunner /srv/__pantheon/Tyr-dist/.well-known
sudo chown certbotrunner /srv/__pantheon/Forseti-dist/.well-known
sudo chown certbotrunner /srv/__pantheon/Sigrun-dist/.well-known
sudo chown certbotrunner /srv/__pantheon/Gullveig/www/.well-known
sudo chown certbotrunner /srv/__pantheon/Mimir/www/.well-known
sudo chown certbotrunner /srv/__pantheon/Frey/www/.well-known
sudo chown certbotrunner /srv/__pantheon/Hugin/www/.well-known

# Also make a directory for pgadmin root to issue the certificate
sudo mkdir /srv/pgadmin
sudo mkdir /srv/pgadmin/.well-known
sudo chown certbotrunner /srv/pgadmin/.well-known
```

### Scripts for letsencrypt SSL certificates setup

Now we need to setup letsencrypt certificates update on host machine. Make some scripts in
`/home/certbotrunner/letsencrypt/` directory as root:

- Script named `make_new_cert.sh`:

```bash
#!/bin/bash

cd /home/certbotrunner/letsencrypt/

# List the root directories and the corresponding domains here (after -d flag)
certbot \
    --config-dir=./conf \
    --work-dir=./workdir \
    --logs-dir=./logs \
    certonly --webroot \
    -w /srv/__pantheon/Bragi-dist -d riichimahjong.org \
    -w /srv/__pantheon/Bragi-dist -d riichi.top \
    -w /srv/pgadmin -d database.riichimahjong.org \
    -w /srv/__pantheon/Tyr-dist -d assist.riichimahjong.org \
    -w /srv/__pantheon/Forseti-dist -d manage.riichimahjong.org \
    -w /srv/__pantheon/Mimir/www -d gameapi.riichimahjong.org \
    -w /srv/__pantheon/Frey/www -d userapi.riichimahjong.org \
    -w /srv/__pantheon/Sigrun-dist -d rating.riichimahjong.org \
    -w /srv/__pantheon/Hugin/www -d syslog.riichimahjong.org \
    -w /srv/__pantheon/Gullveig/www -d storage.riichimahjong.org \
    -w /srv/__pantheon/Tyr-dist -d m.riichi.top \
    -w /srv/__pantheon/Sigrun-dist -d r.riichi.top

```

- Script named `update_cert.sh`

```bash
#!/bin/bash

cd /home/certbotrunner/letsencrypt/

echo "Updating certs..."
certbot \
    --config-dir=./conf \
    --work-dir=./workdir \
    --logs-dir=./logs \
    renew --verbose
echo "Success!"

```

- Script named `copy_certs.sh`

```bash
#!/bin/bash

# Note that you'll need to adjust paths in /home/certbotrunner/letsencrypt/conf/live accordingly 
# after the certificates are prepared.  
cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org-0001/cert.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org-0001/chain.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org-0001/fullchain.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org-0001/privkey.pem /etc/nginx/cert/
systemctl reload nginx

```

As root, add execution flag for all created scripts:
```bash
chmod +x *.sh
```

Add the following lines to your `/etc/crontab` (using `sudo vi /etc/crontab`):

```cronexp

12 3 * * * certbotrunner /bin/bash /home/certbotrunner/letsencrypt/update_cert.sh
12 15 * * * certbotrunner /bin/bash /home/certbotrunner/letsencrypt/update_cert.sh
22 3 * * * root /bin/bash /home/certbotrunner/letsencrypt/copy_certs.sh
22 15 * * * root /bin/bash /home/certbotrunner/letsencrypt/copy_certs.sh

```

You may note that most of these actions are already automated by certbot. If this works for you, you can just rely on it
with updating your nginx configs on host.

### Environment variables for Pantheon

Create a production environment file for Pantheon called `/srv/__pantheon/Env/.env.production`. You can use
`.env.example.production` as a starting point. Then call `make prod_start` in pantheon folder as user to fetch and
start pantheon containers.

Run `make deps` as user in pantheon folder to install all the project dependencies. Ignore "Fenrir container is not running"
warning, this service is not intended to be run in production.

Run `make prod_compile` to prepare and run rest of the services.

### Nginx setup

Now we'll need to set up nginx reverse proxy on host machine to allow access to pantheon services from the outside.
Create a file called `/etc/nginx/conf.d/proxy.conf` as root, with following content (adjusting all `server_name`
directives accordingly to your domains):

```nginx configuration
 server {
    listen 80;
    
    server_name rating.riichimahjong.org;
    if ($http_user_agent ~* "SemrushBot|Semrush|AhrefsBot|MJ12bot|YandexImages|MegaIndex.ru|BLEXbot|BLEXBot|ZoominfoBot|YaK|VelenPublicWebCrawler|SentiBot|Vagabondo|SEOkicks|SEOkicks-Robot|mtbot/1.1.0i|SeznamBot|DotBot|Cliqzbot|coccocbot|Scrap|SiteCheck-sitecrawl|MauiBot|GumGum|Clickagy|AspiegelBot|TkBot|CCBot|Qwantify|MBCrawler|serpstatbot|AwarioSmartBot|Semantici|ScholarBot|proximic|MojeekBot|GrapeshotCrawler|IAScrawler|linkdexbot|contxbot|PlurkBot|PaperLiBot|BomboraBot|Leikibot|weborama-fetcher|NTENTbot|Screaming Frog SEO Spider|admantx-usaspb|Eyeotabot|VoluumDSP-content-bot|SirdataBot|adbeat_bot|TTD-Content|admantx|Nimbostratus-Bot|Mail.RU_Bot|Quantcastboti|Onespot-ScraperBot|Taboolabot|Jobboerse|VoilaBot|Sogou|Jyxobot|Exabot|ZGrab|Proximi|Sosospider|Accoona|aiHitBot|Genieo|BecomeBot|ConveraCrawler|NerdyBot|OutclicksBot|findlinks|JikeSpider|Gigabot|CatchBot|Huaweisymantecspider|Offline Explorer|SiteSnagger|Xaldon_WebSpider|BackDoorBot|AITCSRoboti|Arachnophilia|BackRub|BlowFishi|CherryPicker|CyberSpyder|EmailCollector|Foobot|LinkScan|Openbot|Snooper|SuperBot|URLSpiderPro|MAZBot|EchoboxBot|SerendeputyBot|LivelapBot|linkfluence.com|TweetmemeBot|LinkisBot|CrowdTanglebot") { return 403; }

    location / {
          proxy_pass http://127.0.0.1:4002/;
          gzip on;
          gzip_proxied any;
          proxy_set_header Host sigrun.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /.well-known/ {
         root /srv/__pantheon/Sigrun-dist;
    }
 }

server {
    listen 80;

    server_name gameapi.riichimahjong.org;

    location / {
          gzip on;
          gzip_proxied any;
          proxy_pass http://127.0.0.1:4001/;
          proxy_set_header Host mimir.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /.well-known/ {
        root /srv/__pantheon/Mimir/www;
    }
 }

server {
    listen 80;

    server_name userapi.riichimahjong.org;

    location / {
          gzip on;
          gzip_proxied any;
          proxy_pass http://127.0.0.1:4004/;
          proxy_set_header Host frey.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /.well-known/ {
        root /srv/__pantheon/Frey/www;
    }
 }

 server {
    listen 80;

    server_name assist.riichimahjong.org;

    location /.well-known/ {
        root /srv/__pantheon/Tyr-dist;
    }

    location / {
          gzip on;
          gzip_proxied any;
          proxy_pass http://127.0.0.1:4003/;
          proxy_set_header Host tyr.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }
 }

server {
    listen 80;

    server_name manage.riichimahjong.org;

    location / {
          gzip on;
          gzip_proxied any;
          proxy_pass http://127.0.0.1:4007/;
          proxy_set_header Host forseti.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /.well-known/ {
         root /srv/__pantheon/Forseti-dist;
    }
}

server {
    listen 80;

    server_name syslog.riichimahjong.org;

    location / {
          gzip on;
          gzip_proxied any;
          proxy_pass http://127.0.0.1:4010/;
          proxy_set_header Host hugin.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header REMOTE_ADDR $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /.well-known/ {
        root /srv/__pantheon/Hugin/www;
    }
}

server {
    listen 80;

    server_name database.riichimahjong.org;

    location /.well-known/ {
        root /srv/pgadmin;
    }

    location / {
          gzip on;
          gzip_proxied any;
          auth_basic           "Restricted area";
          auth_basic_user_file conf.d/htpasswd;
          proxy_pass http://127.0.0.1:5632/;
          proxy_set_header Host database.riichimahjong.org; # should match server_name directive content
          proxy_pass_header    Set-Cookie;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;

    server_name storage.riichimahjong.org;

    location /.well-known/ {
        root /srv/__pantheon/Gullveig/www;
    }

    location / {
          gzip on;
          gzip_proxied any;
          proxy_pass http://127.0.0.1:4012/;
          proxy_set_header Host gullveig.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header REMOTE_ADDR $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# This one can be omitted, if you don't want pantheon landing page to be hosted anywhere
server {
    listen 80;

    server_name riichimahjong.org;

    location / {
          proxy_pass http://127.0.0.1:4008/;
          gzip on;
          gzip_proxied any;
          proxy_set_header Host bragi.pantheon.internal;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /.well-known/ {
         root /srv/__pantheon/Bragi-dist;
    }

    location ~ /\.ht {
          deny  all;
    }

    location ~ /\.git {
          deny all;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
          root   html;
    }
}

```

Note that some services (database manager, monitoring) require basic http authentication, so `htpasswd` file
should be created in `/etc/nginx/conf.d/`. Use `htpasswd` command from `apache2-utils` package, run as root:

```bash
cd /etc/nginx/conf.d/
htpasswd -c htpasswd YOUR_USERNAME
```

After this is done, you should be able to restart your nginx service on host machine:

```bash
sudo nginx -t # check if configuration is good
sudo systemctl reload nginx # reload the configuration
```

Check if everything is good by running the following:

```bash
curl http://127.0.0.1 -H 'Host: rating.riichimahjong.org'
```

If this command outputs proper html from pantheon, you should be good to continue.

### Setting up DNS and reverse DNS

Now you will need to adjust your DNS settings in your DNS control panel and set IP address for all your
domains to new server IP. This may take some time to update everywhere.

Also, to send emails, you will need to set your reverse DNS lookup to match your primary hostname
(it should be the hostname emails are sent from, e.g. it should be `riichimahjong.org` if email
address is `noreply@riichimahjong.org`. This is typically done through the control panel of your
hosting provider. You may need to restart your server to apply the changes, if this is the case,
don't forget to rerun pantheon containers after restart using `make prod_start` in pantheon folder.

### Issuing SSL certificates and finalizing nginx setup

After the above is done and all changes are propagated to all DNS servers, you will need to try issuing the https
certificates. Use `make_new_cert.sh` script created earlier and just run it under `certbotrunner` user:

```bash
./make_new_cert.sh
```

If there are some errors during certificates issuing, this means DNS records are not updated yet. Wait a bit for this process to complete.

When the certificates are issued successfully, you can return/uncomment the removed/commented lines in your `/etc/nginx/conf.d/proxy.conf`.
Next copy certificates to the nginx folder, run as root:
```bash
mkdir /etc/nginx/cert
chmod 600 /etc/nginx/cert
openssl dhparam -out /etc/nginx/cert/dhparams.pem 4096 # generate initial config for diffie-hellman handshakes, may take couple of minutes
bash /home/certbotrunner/letsencrypt/copy_certs.sh
```

Nginx server on your host should be set up for handling SSL connections using issued certificates. For this, add the following lines
inside each `server {}` directive right after `listen 80;`:

```nginx configuration
listen 443 ssl http2;
ssl_certificate         /etc/nginx/cert/fullchain.pem;
ssl_certificate_key     /etc/nginx/cert/privkey.pem;
ssl_trusted_certificate /etc/nginx/cert/chain.pem;
ssl_session_cache  shared:SSL:10m;
ssl_session_timeout  10m;
ssl_ciphers "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS !RC4";
ssl_prefer_server_ciphers on;
ssl_dhparam /etc/nginx/cert/dhparams.pem;
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
add_header Strict-Transport-Security max-age=31536000;
```

Test the configuration and restart nginx on your host if it's ok:
```bash
nginx -t
systemctl reload nginx
```

### Setting up mail agent

Next you'll need to create opendkim keys for your mailserver or migrate them from your previous setup.

To migrate:
- We assume all keys are already generated and DNS records are added.
- As root on your previous server, archive the keys folder like this: `tar czf /root/keys.tar.gz /srv/__pantheon/Hermod/opendkim_keys`
- Copy the archive to the new server any way you like (ssh, sftp, etc) and place it under root home folder.
- Unarchive the keys folder on the new server: `cd / && tar xf /root/keys.tar.gz`

To make new keys:
- Ensure you have previously set ALLOWED_SENDER_DOMAINS variable in `Env/.env.production`. If not, set it and restart the containers using `make prod_restart`.
- Enter Hermod container using `make shell_hermod`
- Make a folder inside container named as your domain: `mkdir /etc/opendkim/keys/riichimahjong.org`
- Run key generator: `opendkim-genkey -b 1024 -d riichimahjong.org -D /etc/opendkim/keys/riichimahjong.org -s default -v`
- Set proper owner for the files: `chown opendkim:opendkim /etc/opendkim/keys -R`
- Set up a symlink for default private key: `cd /etc/opendkim/keys && ln -s riichimahjong.org/default.private riichimahjong.org.private`
- Ensure files `/etc/opendkim/KeyTable` and `/etc/opendkim/SigningTable` to contain your host everywhere.
- Get public key: `cat /etc/opendkim/keys/riichimahjong.org/default.txt`
- The contents displayed should be added as a TXT record to the DNS record list of your domain. Make sure to remove the trailing comment
  and remove parentheses from the generated content. Also replace the "default._domainkey" with "mail._domainkey" to make spam filters happy.
  Resulting string should look like this:
  ```
  mail._domainkey 10800 IN TXT "v=DKIM1; k=rsa; " "p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5mHvWwX15ZjNxzqaz48WPGFy5YKzYuOLfbRGvhazyVx6kBtKautNFZbXOj+J8hbxo+1al3HcUKtR8jl0C2EKVNWoDjRSKMUeqggnZsVT9THFVeuwqtp0x4xjZwD+EoFuT8dxFacTY0r7oFW5zsfVWttiU19gdPSyZC2I4D0IwDrTEv+W1OfSUMxl1DfXjRw63SHIZ0VkzD37hd"
  ```

- Add DMARC record to your DNS: `_dmarc 10800 IN TXT "v=DMARC1; p=reject; pct=100; rua=mailto:noreply@riichimahjong.org"`
- Add SPF record to your DNS: `@ 10800 IN TXT "v=spf1 a mx ip4:IP_OF_YOUR_SERVER ~all"`
- Restart your containers to update configuration of mail agent.

This is likely to be enough to send mails from your server. Ensure that port 25 is not closed by your hosting provider, otherwise you might need to use
external mail agent (see RELAYHOST_* variables in production environment config example).

### Database and backups related hints

If you're migrating to the new instance, transfer the database:
- From pantheon folder on your old server, run `make db_export` as user
- Copy `Database/export.tar.gz` file from one server to another, to the same location
- From pantheon folder on your new server, run `make db_import` as user as well.

Don't forget to setup your backups on github:
- Create a private repository
- Update environment config and set the following variable to your repo address: `BACKUP_GIT_REMOTE=git@github.com:YOUR_USERNAME/backups.git`
- Open database container using `make shell_db` as user from pantheon folder
- Get your public key using `cat /var/lib/postgresql/.ssh/id_rsa.pub` - it's generated automatically on container start.
- Add this public key to the list of SSH keys in github settings.
- Exectue the following commands in container to reinitialize your backup repo folder:
```bash
su postgres
cd ~/backup
git remote add origin git@github.com:YOUR_USERNAME/backups.git
git branch -M main
git push -u origin main
```

Now the backups are set up and will be performed once an hour.

### Miscellaneous

To setup Telegram bot for notifications, just put your bot token to the `BOT_TOKEN` variable in environment config
and put your bot nickname to `VITE_BOT_NICKNAME` variable (this is used only in admin panel in informational purposes).
After it's set, restart containers via `make prod_restart` from pantheon folder.

If you're migrating existing installation, you'll also need to transfer uploaded avatars to new server.
- On your old server, run `make shell_gullveig` from pantheon folder as user
- Archive the avatars using `cd /var/storage/files && tar czf avatars.tar.gz avatars`
- Exit the container shell (Ctrl-D or `exit`)
- Find Gullveig service ID using `docker ps | grep gullveig` - you'll need the first value in the line.
- Copy avatars archive to host machine with `docker cp GULLVEIG_ID:/var/storage/files/avatars.tar.gz ~/`
- Transfer avatar archive to your new server any way you want (ssh, sftp, etc) and place it into your user home folder
- On your new server, find Gullveig service ID again using the same command `docker ps | grep gullveig`
- Copy the archive inside container using `docker cp ~/avatars.tar.gz GULLVEIG_ID:/var/storage/files/`
- Go to pantheon folder and open Gullveig container using `make shell_gullveig`
- In Gullveig shell, run `cd /var/storage/files && tar xf avatars.tar.gz`
- Remove the archive: `rm /var/storage/files/avatars.tar.gz`

Avatars should be displayed correctly after this is completed.
