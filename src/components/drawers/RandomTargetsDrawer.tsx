import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import {
  CheckSquareIcon,
  CircleDotIcon,
  GridIcon,
  PaletteIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import type React from "react";
import { Fragment } from "react";
import {
  isRandomTargetsModalOpenAtom,
  randomTargetsAtom,
} from "../../state/sketchStore";
import type { RandomTargets } from "../../types/sketch";

interface TargetGroup {
  title: string;
  icon: React.ReactNode;
  items: {
    key: keyof RandomTargets;
    label: string;
    desc: string;
    subGroup?: string;
  }[];
}

export const RandomTargetsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(isRandomTargetsModalOpenAtom);
  const [randomTargets, setRandomTargets] = useAtom(randomTargetsAtom);

  const toggleTarget = (key: keyof RandomTargets) => {
    setRandomTargets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAll = (enable: boolean) => {
    setRandomTargets({
      canvasAspectRatio: enable,
      canvasPadding: enable,
      palette: enable,
      paletteShuffle: enable,
      centerRadius: enable,
      emission: enable,
      deflation: enable,
      wander: enable,
      distinctChildColor: enable,
      organicParentGrowth: enable,
      effects: enable,
      circleOpacity: enable,
      randomSeed: enable,
      transitionType: enable,
      grain: enable,
      riso: enable,
      halftone: enable,
      dithering: enable,
      inkBleed: enable,
      paperTexture: enable,
      cmyk: enable,
      vignette: enable,
      peripheralBlur: enable,
    });
  };

  const selectGroup = (keys: (keyof RandomTargets)[], enable: boolean) => {
    setRandomTargets((prev) => {
      const next = { ...prev };
      for (const k of keys) {
        next[k] = enable;
      }
      return next;
    });
  };

  const targetGroups: TargetGroup[] = [
    {
      title: "キャンバス & 基本設定",
      icon: <GridIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "canvasAspectRatio",
          label: "描画領域の上下比率 (縦横比)",
          desc: "アスペクト比 (0.5〜2.0) のランダム変更",
        },
        {
          key: "canvasPadding",
          label: "キャンバス外周マージン率",
          desc: "描画エリアの外周余白",
        },
        {
          key: "randomSeed",
          label: "ランダムシード値",
          desc: "プロシージャル生成の乱数シード",
        },
      ],
    },
    {
      title: "カラーパレット & テーマ",
      icon: <PaletteIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "palette",
          label: "カラーパレット選定",
          desc: "プリセット配色からのランダム選定",
        },
        {
          key: "paletteShuffle",
          label: "パレット内の配色シャッフル",
          desc: "選択中パレットの背景・描画色の入れ替え",
        },
      ],
    },
    {
      title: "風船球体 & 放出シミュレーション",
      icon: <CircleDotIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "centerRadius",
          label: "母体中心円の基本半径",
          desc: "中央の母体円の大きさ (40〜180px)",
        },
        {
          key: "emission",
          label: "子円の放出頻度・ゆらぎ・初速",
          desc: "発射インターバル、ゆらぎJitter、初速の変更",
        },
        {
          key: "deflation",
          label: "空気抜け速度 (収縮レート)",
          desc: "風船の空気抜け・縮小スピードの変更",
        },
        {
          key: "wander",
          label: "蛇行軌跡・有機的揺らぎ・軌跡履歴長",
          desc: "うねり強度、周波数、慣性平滑化、描画密度の変更",
        },
        {
          key: "distinctChildColor",
          label: "放出円の色を親円と別色にする",
          desc: "親円と異なるカラーを子円に割り当て",
        },
        {
          key: "organicParentGrowth",
          label: "ベース円の有機的成長・放出縮小",
          desc: "吸気成長速度および放出時の反動縮小係数",
        },
        {
          key: "effects",
          label: "視覚エフェクト (Opt-in)",
          desc: "呼吸脈動、光沢ハイライト、グロー、外周線のON/OFF",
        },
        {
          key: "circleOpacity",
          label: "不透明度 (ソリッド度)",
          desc: "円および軌跡の透過・ソリッド度合い",
        },
      ],
    },
    {
      title: "アーティスティックエフェクト",
      icon: <SparklesIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "grain",
          label: "グレイン",
          desc: "グレイン質感ON/OFFと強度の変更",
          subGroup: "エフェクト",
        },
        {
          key: "halftone",
          label: "ハーフトーン",
          desc: "ドットスクリーンのON/OFFとサイズ",
          subGroup: "エフェクト",
        },
        {
          key: "dithering",
          label: "ディザリング",
          desc: "レトロゲーム風ディザリング階調のON/OFF",
          subGroup: "エフェクト",
        },
        {
          key: "vignette",
          label: "ビネット",
          desc: "四隅の減光ON/OFFと強度の変更",
          subGroup: "エフェクト",
        },
        {
          key: "peripheralBlur",
          label: "周辺ぼかし",
          desc: "中心クリア・周辺ぼかしのON/OFFと強度の変更",
          subGroup: "エフェクト",
        },
        {
          key: "cmyk",
          label: "CMYK印刷",
          desc: "4色分解・独立版ズレ係数と乗算重ね刷りのON/OFF",
          subGroup: "実験的エフェクト",
        },
        {
          key: "riso",
          label: "リソグラフ風印刷 (Risograph)",
          desc: "色版ズレと乗算インクカスレノイズのON/OFF",
          subGroup: "実験的エフェクト",
        },
        {
          key: "inkBleed",
          label: "インク染み・滲み",
          desc: "輪郭のノイズ滲み・浸透ディスプレイスメントのON/OFF",
          subGroup: "実験的エフェクト",
        },
        {
          key: "paperTexture",
          label: "和紙の質感",
          desc: "和紙の凸凹感と陰影のON/OFF",
          subGroup: "実験的エフェクト",
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 left-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden text-gray-800"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CheckSquareIcon className="w-5 h-5 text-gray-700" />
                <div>
                  <h2 className="text-sm font-bold text-gray-900 leading-none">
                    ランダム化対象の選択
                  </h2>
                  <p className="text-[11px] text-gray-600 mt-1">
                    ダイスボタン実行時に変更するパラメータを選択
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 border-b border-gray-200 text-xs">
              <span className="text-gray-600 font-medium">
                一括切り替え:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAll(true)}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[11px] font-medium text-gray-700 transition cursor-pointer shadow-2xs"
                >
                  すべて選択
                </button>
                <button
                  type="button"
                  onClick={() => selectAll(false)}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[11px] font-medium text-gray-700 transition cursor-pointer shadow-2xs"
                >
                  すべて解除
                </button>
              </div>
            </div>

            {/* Target Options List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar text-xs">
              {targetGroups.map((group) => {
                const groupKeys = group.items.map((i) => i.key);
                let lastSubGroup = "";

                return (
                  <div key={group.title} className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs">
                        {group.icon}
                        <span>{group.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => selectGroup(groupKeys, true)}
                          className="text-gray-600 hover:text-gray-900 underline cursor-pointer"
                        >
                          全選択
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => selectGroup(groupKeys, false)}
                          className="text-gray-600 hover:text-gray-900 underline cursor-pointer"
                        >
                          全解除
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {group.items.map((item) => {
                        const isSubHeaderNeeded =
                          item.subGroup && item.subGroup !== lastSubGroup;
                        if (item.subGroup) lastSubGroup = item.subGroup;

                        return (
                          <Fragment key={item.key}>
                            {isSubHeaderNeeded && (
                              <div className="pt-2 pb-0.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                {item.subGroup}
                              </div>
                            )}
                            <label className="flex items-start gap-2.5 p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!randomTargets[item.key]}
                                onChange={() => toggleTarget(item.key)}
                                className="mt-0.5 rounded text-gray-900 focus:ring-gray-900 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 text-xs">
                                  {item.label}
                                </div>
                                <div className="text-[11px] text-gray-600 leading-tight">
                                  {item.desc}
                                </div>
                              </div>
                            </label>
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-medium transition cursor-pointer shadow-xs"
              >
                完了
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
