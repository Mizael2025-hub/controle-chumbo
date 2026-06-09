# Enviar alterações locais para o GitHub
# Chamado por enviar_GitHub.bat — não executar diretamente

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

function Show-Message {
    param(
        [string]$Text,
        [string]$Title = 'Enviar GitHub',
        [System.Windows.Forms.MessageBoxIcon]$Icon = 'Information'
    )
    [void][System.Windows.Forms.MessageBox]::Show($Text, $Title, 'OK', $Icon)
}

if (-not (Test-Path (Join-Path $repoRoot '.git'))) {
    Show-Message 'Esta pasta não é um repositório Git.' -Icon Error
    exit 1
}

$changes = git status --porcelain
if (-not $changes) {
    Show-Message 'Nenhuma alteração para enviar.' -Icon Information
    exit 0
}

$changeCount = ($changes | Measure-Object -Line).Lines
$branch = (git rev-parse --abbrev-ref HEAD 2>$null)
if (-not $branch) { $branch = 'master' }

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Enviar para GitHub'
$form.Size = New-Object System.Drawing.Size(500, 280)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.Font = New-Object System.Drawing.Font('Segoe UI', 10)

$infoLabel = New-Object System.Windows.Forms.Label
$infoLabel.Text = "$changeCount arquivo(s) alterado(s) · branch: $branch"
$infoLabel.Location = New-Object System.Drawing.Point(12, 12)
$infoLabel.AutoSize = $true
$infoLabel.ForeColor = [System.Drawing.Color]::FromArgb(80, 80, 80)
$form.Controls.Add($infoLabel)

$label = New-Object System.Windows.Forms.Label
$label.Text = 'Mensagem do commit:'
$label.Location = New-Object System.Drawing.Point(12, 40)
$label.AutoSize = $true
$form.Controls.Add($label)

$textBox = New-Object System.Windows.Forms.TextBox
$textBox.Location = New-Object System.Drawing.Point(12, 65)
$textBox.Size = New-Object System.Drawing.Size(460, 120)
$textBox.Multiline = $true
$textBox.ScrollBars = 'Vertical'
$form.Controls.Add($textBox)

$okButton = New-Object System.Windows.Forms.Button
$okButton.Text = 'Enviar'
$okButton.Location = New-Object System.Drawing.Point(300, 200)
$okButton.Size = New-Object System.Drawing.Size(80, 32)
$okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.AcceptButton = $okButton
$form.Controls.Add($okButton)

$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Text = 'Cancelar'
$cancelButton.Location = New-Object System.Drawing.Point(392, 200)
$cancelButton.Size = New-Object System.Drawing.Size(80, 32)
$cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.CancelButton = $cancelButton
$form.Controls.Add($cancelButton)

$result = $form.ShowDialog()
if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
    exit 0
}

$message = $textBox.Text.Trim()
if ([string]::IsNullOrWhiteSpace($message)) {
    Show-Message 'Informe uma mensagem de commit.' -Icon Warning
    exit 1
}

git add -A 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Show-Message 'Falha ao preparar arquivos (git add).' -Icon Error
    exit 1
}

$staged = git diff --cached --name-only 2>$null
if ($staged -match '(^|/)\.env\.local$') {
    git reset HEAD -- .env.local 2>&1 | Out-Null
    Show-Message '.env.local foi excluído do envio por segurança.' -Icon Warning
}

$stagedAfter = git diff --cached --name-only 2>$null
if (-not $stagedAfter) {
    Show-Message 'Nenhum arquivo válido para commit após filtros de segurança.' -Icon Warning
    exit 1
}

$commitOutput = git commit -m $message 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Show-Message "Falha no commit:`n$commitOutput" -Icon Error
    exit 1
}

$pushOutput = git push origin $branch 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Show-Message "Commit criado, mas falha no push:`n$pushOutput" -Icon Error
    exit 1
}

Show-Message "Enviado com sucesso!`n`nBranch: $branch`nRepositório: github.com/Mizael2025-hub/controle-chumbo"
exit 0
