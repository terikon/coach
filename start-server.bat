set catch=goto Error

npm run server --prefix app || %catch%
goto Exit

:Error
echo Error occured in %~nx0
pause
exit 1

:Exit
exit /b
