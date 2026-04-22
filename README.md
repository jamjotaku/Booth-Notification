# BOOTH 新着通知システム (Discord Notifier)

BOOTHの特定ショップを監視し、商品が追加されたときにDiscordのWebhookを通じてメッセージを送るシステムです。
GitHub Actionsを利用しており、サーバー不要・完全無料で運用できます。

## セットアップ手順

### 1. リポジトリの作成
1. GitHubで新しいリポジトリ（Private推奨）を作成します。
2. このプロジェクトのファイル一式をアップロード（Push）してください。

### 2. Discord Webhookの取得
1. 通知を送りたいDiscordチャンネルの設定から「連携サービス」→「ウェブフック」を作成します。
2. ウェブフックURLをコピーしておきます。

### 3. GitHub Secretsの設定
1. GitHubリポジトリの `Settings` > `Secrets and variables` > `Actions` に移動します。
2. `New repository secret` をクリックします。
3. 名前を `DISCORD_WEBHOOK_URL` にし、コピーしたURLを貼り付けて保存します。

### 4. 監視対象ショップの編集
1. `config/shops.json` を開き、監視したいショップを追加します。
   - `id`: ショップのURLが `https://test-shop.booth.pm/` なら `test-shop` と入力します。
   - `name`: Discord通知に表示されるショップ名です。自由に設定できます。
2. 変更をPushすると、自動的に反映されます。

## 使い方
- **自動実行**: デフォルトでは15分おきに自動でチェックが走ります。
- **手動実行**: GitHubリポジトリの `Actions` タブから `BOOTH Monitor` を選び、`Run workflow` をクリックすると即座に実行できます。

### 初回実行について
- 初めて登録したショップについては、通知の連投を防ぐため、**現在の出品商品を記憶するだけ**で通知は送りません。
- 記憶した後の「次回の更新」から通知が届くようになります。

## カスタマイズ
- 実行間隔を変えたい場合は、`.github/workflows/monitor.yml` の `cron` の値を変更してください（例：`0 * * * *` で1時間おき）。
