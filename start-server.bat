set catch=goto Error

cd app
npm run server || %catch%
goto Exit

:Error
echo Error occured in %~nx0
pause
exit 1

:Exit
exit /b
