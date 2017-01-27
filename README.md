
### Medic DA is an application developed in python for prediction heart disease using machine learning
The project is divided into three part

Part 1 - Machine Learning
We use data from UCI machine Learning repository for the machine learning part
Different machine learning algorithm are trained on the data and the best algorithm based on the accuracy metric both on the training data and testing is chosen for the final project

Part 2 - Web server
Flask is used to build a restful web-server for the application

Part 3 - Web Client
VueJS is used for consuming the Rest from the web server
**Prequisites:**

Application Instation Instruction
There are 2 approach to runjing the application. This can be run using Docker or anaconda (or by just installing the neccessary python library on your machine)

** Evironment setup **	
1.  Download the MedicDA
2.  Optional - Install Anaconda you can get it here https://www.continuum.io/downloads
3.  Optional - Install any text editor:
    * [Pycharm Community Edition](https://www.jetbrains.com/pycharm/), [Sublime Text](https://dbader.org/blog/setting 
    up-sublime-text-for-python-development), and [Atom](http://www.marinamele.com/install-and-configure-atom-editor-for-python)
    are all great for this. **I highly recommend Atom or PyCharm for people who don't like configuring an editor.**
    * If you use atom, all of the extensions are optional. It supports python and autocompletions out of the box. If you follow
    the installation instructions for linter and flake8, make sure you are not in an virtual environment, and use the location
    for your flake8 installation (find with `which flake8` for Linux/Mac) rather than for the author's. 
    If on Windows, use the atom installer ctrl+shift+p and type install packages. From that interface you can install all of
    your packages.
4.  Optional (You can run the application if your environment is setup) - Create a virtual environment: `conda create -n venv python=3.5 anaconda`
5.  Use venv: 
    * Mac/Linux: `source env/bin/activate` (to leave a virtual environment type `deactivate`)
    * Window: activate venv
    * Bash Terminal: source activate venv
6.  Install dependencies into virtual environment:
    * Mac/Linux: `pip install -r requirements.txt`
    * `pip freeze` should show a list of dependencies installed
    * GTK+ follow the link to download for your machine https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer

	
**Run application**

1.  To run ML part - Just to play with the code. This is not needed for the application to run:
    * on your command terminal change directory to Machine Learning Folder and run command `jupyter notebook`
    * From there lauch the MedicDA.ipynb
2.  Run the program:
    * from command line (after you activate env) type `python views.py`
    * from the browser go to localhost:5002


Using Docker:
    * Build Docker Image: 'docker build -t medic-da .'
    * Run application: 'docker run -d -p 5002:5002 flask-sample-one
    * from the browser go to localhost:5002
	

Enjoy...
