FROM ubuntu:latest
MAINTAINER Tajudeen Kolawole "bamtak@hotmail.com"
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential libssl-dev libffi-dev libxml2-dev libxslt1-dev zlib1g-dev python-lxml python-cffi libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 shared-mime-info
RUN pip install --upgrade pip
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
ENTRYPOINT ["python"]
CMD ["views.py"]