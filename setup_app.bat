@echo off
echo Setting up ConfidenceLab...

echo Installing Frontend dependencies...
call npm install

echo Creating Python virtual environment with Python 3.10...
cd backend
py -3.10 -m venv venv
echo Installing Python dependencies - this may take 10-20 minutes...
call venv\Scripts\activate
pip install -r requirements.txt
call venv\Scripts\deactivate.bat
cd ..

echo Setup complete! Run start_app.bat to launch the app.
pause
