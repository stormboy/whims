NAME=front
DEST=/var/www/default/streaming/${NAME}
URL=http://home.sugarcoding.net/streaming/${NAME}

vlc -I dummy http://192.168.0.2/mjpg/video.mjpg vlc://quit \
--sout='#transcode{width=320,height=240,fps=25,vcodec=h264,vb=256,venc=x264{aud,profile=baseline,level=30,keyint=30,ref=1}}:std{access=livehttp{seglen=10,delsegs=true,numsegs=5,index=${DEST}.m3u8,index-url=${URL}-########.ts},mux=ts{use-key-frames},dst=${DEST}-########.ts}'


vlc -I dummy http://192.168.0.2/mjpg/video.mjpg vlc://quit \
--sout='#transcode{width=320,height=240,fps=25,vcodec=h264,vb=256,venc=x264{aud,profile=baseline,level=30,keyint=30,ref=1},acodec=mp3,ab=96}:std{access=livehttp{seglen=10,delsegs=true,numsegs=5,index=/var/www/default/streaming/front.m3u8,index-url=http://home.sugarcoding.net/streaming/front-########.ts},mux=ts{use-key-frames},dst=/var/www/default/streaming/front-########.ts}' 
