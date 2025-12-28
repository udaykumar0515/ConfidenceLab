@echo off
echo Setting up ConfidenceLab...

echo Installing Frontend Dependencies...
call npm install

echo Setting up Backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo Setup complete! You can now run start_app.bat
pause
