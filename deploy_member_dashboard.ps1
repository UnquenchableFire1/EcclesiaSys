#!/usr/bin/env pwsh
cd "c:\Users\Buckman\Desktop\BBJ digital"
git add frontend/src/pages/MemberDashboard.jsx frontend/src/pages/Register.jsx frontend/src/pages/Login.jsx frontend/src/App.jsx
git commit -m "Add member dashboard with profile and content overview - members redirect here after login"
git push origin main
Write-Host "Deployed successfully!"
