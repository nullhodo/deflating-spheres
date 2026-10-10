# deflating-spheres

放たれた球体が空気を抜かれながら有機的な軌跡を描いて縮小・消滅する、p5.jsジェネラティブアートスタジオ。

## 1. 概要

中央の母体球体から周期的に子球体が放出され、空気の抜ける風船のように自発的に収縮しながら、調和振動波とパーリンノイズの干渉によって蛇行した軌跡を描き出します。
React、Jotai、Tailwind CSSで構築された直感的なGUIを通じて、物理パラメータ、視覚エフェクト、カラーパレット、アーティスティックフィルターをリアルタイムに調整できます。
mp4-muxer による高速動画録画、高解像度画像出力、SVGベクター保存、設定JSONのエクスポートに対応しています。

## 2. 技術スタック

- 言語: TypeScript 5.9
- UIライブラリ: React 18, Framer Motion
- アイコン: Lucide React
- 状態管理: Jotai
- クリエイティブコーディング: p5.js, p5.js-svg
- 録画エンコード: mp4-muxer (WebCodecs VideoEncoder)
- スタイリング: Tailwind CSS
- ビルドツール: Vite 6
- パッケージマネージャー: pnpm
- リンター / フォーマッター: Biome
- テストフレームワーク: Vitest
- 未使用コード検知: Knip

## 3. ディレクトリ構造

```text
deflating-spheres/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── biome.json
├── .gitignore
├── README.md
├── output/                           - 生成された画像や録画動画の保存用ディレクトリ
├── test/
│   ├── OrganicDeflatingCircle.test.ts - 球体物理・収縮・軌跡更新の単体テスト
│   └── colorUtils.test.ts            - グラデーション生成および配色解決の単体テスト
└── src/
    ├── main.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types/
    │   └── sketch.ts                 - パラメータおよび型定義
    ├── constants/
    │   └── palettes.ts               - プリセットカラーパレット定義
    ├── state/
    │   └── sketchStore.ts            - Jotaiグローバル状態管理アトム
    ├── core/
    │   ├── recorder.ts               - mp4-muxerおよびMediaRecorderによる録画マネージャー
    │   ├── exporter.ts               - 高解像度画像・SVG・設定JSONのエクスポート処理
    │   ├── sketch/
    │   │   ├── OrganicDeflatingCircle.ts - 収縮球体の運動方程式・ノイズステアリング・描画クラス
    │   │   └── deflatingSphereSketch.ts  - 母体円・子円群の統合シミュレーション管理
    │   └── renderers/                - 各種アーティスティック質感フィルター
    │       ├── grainOverlay.ts       - ざらつき粒子オーバーレイ
    │       ├── halftoneRenderer.ts   - ハーフトーンドットスクリーン
    │       ├── ditheringRenderer.ts  - レトロゲーム風ディザリング階調
    │       ├── paperTextureRenderer.ts - 和紙の凹凸・陰影テクスチャ
    │       ├── cmykRenderer.ts       - CMYK独立版ズレ・多色刷り
    │       ├── risoRenderer.ts       - リソグラフ風インクカスレ
    │       ├── inkBleedRenderer.ts   - インク染み・滲み
    │       ├── vignetteRenderer.ts   - 四隅減光ビネット
    │       ├── peripheralBlurRenderer.ts - 周辺ぼかしフィルター
    │       └── transitionRenderer.ts - パラメータ変調時のトランジション効果
    ├── components/
    │   ├── ControlPanel.tsx          - メインコントロールパネルUI
    │   ├── RecordingOverlay.tsx      - 録画状態および経過時間のHUD表示
    │   ├── DebugOverlay.tsx          - FPS・粒子数・母体半径のシステムモニター
    │   ├── drawers/
    │   │   └── RandomTargetsDrawer.tsx - ランダム化対象項目の個別選択ドロワー
    │   └── sections/
    │       ├── CustomParametersSection.tsx - 母体円・放出・収縮・Opt-inエフェクト設定
    │       ├── ColorPaletteSection.tsx     - パレット選択・単色モード・グラデーション設定
    │       ├── OperationsSection.tsx       - 周期ランダム実行・アスペクト比設定
    │       ├── ExportSection.tsx           - 画像・SVG・動画・JSON保存
    │       ├── RenderingStyleSection.tsx   - アーティスティック質感エフェクト統合
    │       └── sub/                        - 各質感エフェクトの個別調整サブパネル
    ├── hooks/
    │   ├── useSketchHandlers.ts      - パラメータ変更・Undo/Redo・インポートハンドラー
    │   ├── useKeyboardShortcuts.ts   - キーボードショートカット操作リスナー
    │   └── useWheelRangeSlider.ts    - マウスホイールによるスライダー微調整
    └── utils/
        ├── colorUtils.ts             - グラデーションパレット生成・配色演算
        ├── date.ts                   - 日時フォーマット文字列生成
        ├── noiseUtils.ts             - ノイズ演算ユーティリティ
        └── randomizerUtils.ts        - 選択対象パラメータのランダム生成
```

## 4. 実行方法

| コマンド | 実行内容 |
|---|---|
| `pnpm install` | 依存パッケージのインストール |
| `pnpm dev` | 開発サーバーの起動 (http://localhost:3000) |
| `pnpm build` | TypeScript型検査およびプロダクション用ビルド |
| `pnpm preview` | ビルド成果物のローカルプレビュー |
| `pnpm test` | Vitestによる単体テストの実行 |
| `pnpm check` | Biomeによるリント・フォーマット検証 |
| `pnpm format` | Biomeによる全コードの自動フォーマット適用 |
| `pnpm knip` | Knipによる未使用ファイル・不要エクスポートの検出 |

## 5. 主な機能

- 有機的収縮球体シミュレーション:
  - ベース円の有機的成長（吸気膨張）およびスプリング・ダンパー物理による Ease-In-Out 弾性収縮・復元表現
  - 放出縮小の所要時間（基準: 1.0）、収縮開始タイミング（フチ到達基準）および縮小係数の微調整スライダー
  - 内圧超過に応じた確率的自律放出およびロジスティック飽和による収支均衡
  - 放出される子球体のカラーをベース球体と自動で別色に割り当てるオプション (デフォルト有効)
  - 調和周波数とパーリンノイズによる滑らかなステアリング運動
  - 収縮レートによる自然な空気抜け挙動
  - 過去座標の履歴追跡による減衰テイル描画
- 視覚エフェクト (Opt-in):
  - 呼吸・脈動エフェクト (母体円の周期伸縮)
  - 反射・光沢ハイライト
  - ボケ光量・グローエフェクト
  - 外周輪郭線描画
  - 母体円の中心点描画
- カラー & テーマ管理:
  - デフォルトパレットにヴィンテージな多色ブロック「Retro Color Blocks」を採用
  - プリセットカラーパレットからの選定、シャッフル
  - 単色モード (Single Color)
  - 単色調和グラデーションテーマの自動生成
- アーティスティック質感フィルター:
  - グレインノイズ、ハーフトーン、ディザリング、和紙、CMYK版ズレ、リソグラフ、インク滲み、周辺ぼかし、ビネット
- 多彩なエクスポート機能:
  - mp4-muxer による高画質 60fps MP4 動画録画 (WebCodecs非対応環境では自動フォールバック)
  - 高解像度 PNG 画像出力 (2880x2880) + パラメータ設定 JSON 同時出力
  - ベクター SVG 画像出力
  - n-Loop 自動録画 (指定周期ごとにランダム化しながら録画)
- 操作補助機能:
  - Undo / Redo 履歴機能 (最大50件)
  - ランダム化対象を個別に指定可能なドロワーメニュー
  - キーボードショートカット (Space: ランダム実行, R: 録画開始, S: 録画停止, P: 画像出力, Z: アンドゥ, Y: リドゥ, H: パネル開閉)
  - スライダー上のホイールスクロールによる微調整
