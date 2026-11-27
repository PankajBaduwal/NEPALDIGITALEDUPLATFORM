/**
 * PositionPlayground.tsx (Pure 2D Edition)
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान (Shapes & Position)
 * 2D Simulation: My Position Playground – Inside, Outside, Above and Below
 * मेरो स्थिति खेलमैदान – भित्र, बाहिर, माथि र तल
 * 100% 2D SVG & Canvas – No Three.js/WebGL dependencies.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Play,
  Award,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';
import { FONT_NP, toNp } from '../class1-math-kit/nepali';
import {
  MODE_1_INSIDE_OUTSIDE_TASKS,
  MODE_2_ABOVE_BELOW_TASKS,
  SpatialPlaygroundTask,
} from './PlaygroundLevels';

interface PositionPlaygroundProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: 'ne' | 'en';
}

type Mode = 'INSIDE_OUTSIDE' | 'ABOVE_BELOW' | 'FREE_PLAY' | 'QUIZ';

interface MovableItem {
  id: string;
  nameEn: string;
  nameNp: string;
  emoji: string;
  currentZone: string | null;
}

const INITIAL_ITEMS: MovableItem[] = [
  { id: 'cat', nameEn: 'Cat', nameNp: 'बिरालो', emoji: '🐱', currentZone: null },
  { id: 'dog', nameEn: 'Dog', nameNp: 'कुकुर', emoji: '🐶', currentZone: null },
  { id: 'bird', nameEn: 'Bird', nameNp: 'चरा', emoji: '🐦', currentZone: null },
  { id: 'rabbit', nameEn: 'Rabbit', nameNp: 'खरायो', emoji: '🐰', currentZone: null },
  { id: 'ball', nameEn: 'Ball', nameNp: 'बल', emoji: '⚽', currentZone: null },
  { id: 'pot', nameEn: 'Clay Pot', nameNp: 'घैँटो', emoji: '🏺', currentZone: null },
];

export const PositionPlayground: React.FC<PositionPlaygroundProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<Mode>('INSIDE_OUTSIDE');
  const [taskIdx, setTaskIdx] = useState(0);
  const [items, setItems] = useState<MovableItem[]>(INITIAL_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>('cat');
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isNe = lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const tasks: SpatialPlaygroundTask[] =
    mode === 'INSIDE_OUTSIDE'
      ? MODE_1_INSIDE_OUTSIDE_TASKS
      : mode === 'ABOVE_BELOW'
      ? MODE_2_ABOVE_BELOW_TASKS
      : [];

  const currentTask = tasks[taskIdx % Math.max(1, tasks.length)];

  // Announce current instruction
  useEffect(() => {
    if (currentTask && mode !== 'FREE_PLAY') {
      const msg = isNe ? currentTask.instructionNe : currentTask.instructionEn;
      if (!muted) {
        AudioController.speak(msg, lang);
      }
    }
  }, [taskIdx, mode, lang, muted]);

  const toggleSound = () => {
    AudioController.setMuted(!muted);
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePlaceInZone = (zoneKey: string) => {
    if (!selectedItemId) return;

    AudioController.playPop();

    setItems((prev) =>
      prev.map((it) => (it.id === selectedItemId ? { ...it, currentZone: zoneKey } : it))
    );

    // Evaluate in structured tasks
    if (currentTask && mode !== 'FREE_PLAY') {
      const isTargetObject = selectedItemId === currentTask.targetObject;
      const matchesZone =
        (currentTask.targetPosition === 'inside_house' && zoneKey === 'inside_house') ||
        (currentTask.targetPosition === 'outside_house' && zoneKey === 'outside_house') ||
        (currentTask.targetPosition === 'inside_basket' && zoneKey === 'inside_basket') ||
        (currentTask.targetPosition === 'outside_basket' && zoneKey === 'outside_basket') ||
        (currentTask.targetPosition === 'above_tree' && zoneKey === 'above_tree') ||
        (currentTask.targetPosition === 'below_tree' && zoneKey === 'below_tree') ||
        (currentTask.targetPosition === 'above_table' && zoneKey === 'above_table') ||
        (currentTask.targetPosition === 'below_table' && zoneKey === 'below_table');

      if (isTargetObject && matchesZone) {
        AudioController.playSuccess();
        const successMsg = isNe ? currentTask.successMessageNe : currentTask.successMessageEn;
        setFeedback({ ok: true, text: successMsg });
        setStars((s) => s + 1);
        AudioController.speak(successMsg, lang);

        setTimeout(() => {
          setFeedback(null);
          setTaskIdx((i) => i + 1);
        }, 2000);
      } else {
        AudioController.playBoop();
        const hint = isNe ? currentTask.hint1Ne : currentTask.hint1En;
        setFeedback({ ok: false, text: hint });
        AudioController.speak(hint, lang);
      }
    }
  };

  const resetItems = () => {
    setItems(INITIAL_ITEMS);
    setSelectedItemId('cat');
    setFeedback(null);
  };

  const getItemsInZone = (zoneKey: string) => items.filter((it) => it.currentZone === zoneKey);
  const unplacedItems = items.filter((it) => it.currentZone === null);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F7F5',
        fontFamily: FONT_NP,
        color: '#26332E',
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: '#142D4E', borderBottom: '3px solid #167C80',
          color: '#FFFFFF',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> {L('पुस्तकालय', 'Library')}
          </button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9FCBCD' }}>
              {L('कक्षा १ • गणित • अध्याय १', 'Class 1 • Mathematics • Chapter 1')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {L('मेरो स्थिति खेलमैदान (भित्र, बाहिर, माथि, तल)', 'Position Playground (Inside, Outside, Above, Below)')}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.22)',
              padding: '6px 14px',
              borderRadius: 20,
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            <Award size={16} color="#FDE047" />
            <span>{isNe ? toNp(stars) : stars}</span>
          </div>

          <button
            onClick={() => setLang(isNe ? 'en' : 'ne')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isNe ? 'English' : 'नेपाली'}
          </button>

          <button
            onClick={toggleSound}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 10px',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 10px',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* ── Mode Navigation Tabs ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '10px 18px',
          background: '#FFFFFF',
          borderBottom: '1px solid #DCE5DE',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {[
          { key: 'INSIDE_OUTSIDE', np: 'भित्र र बाहिर', en: 'Inside & Outside', icon: '🏠' },
          { key: 'ABOVE_BELOW', np: 'माथि र तल', en: 'Above & Below', icon: '🌳' },
          { key: 'FREE_PLAY', np: 'स्वतन्त्र खेल', en: 'Free Play', icon: '🎈' },
        ].map((tab) => {
          const active = mode === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setMode(tab.key as Mode);
                setTaskIdx(0);
                setFeedback(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 12,
                border: active ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: active ? '#187C68' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#26332E',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: active ? '0 2px 6px rgba(24,124,104,0.25)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span>{L(tab.np, tab.en)}</span>
            </button>
          );
        })}

        <button
          onClick={resetItems}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 12,
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#475569',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} /> {L('पुनः सुरु', 'Reset')}
        </button>
      </div>

      {/* ── Instruction Banner ─────────────────────────────────── */}
      {currentTask && mode !== 'FREE_PLAY' && (
        <div
          style={{
            background: '#E7F1FC',
            borderBottom: '1px solid #BFDBFE',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1E3A8A' }}>
                {L(currentTask.instructionNe, currentTask.instructionEn)}
              </div>
              <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 700 }}>
                {L(currentTask.titleNe, currentTask.titleEn)}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const msg = isNe ? currentTask.instructionNe : currentTask.instructionEn;
              AudioController.speak(msg, lang);
            }}
            style={{
              background: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Volume2 size={14} /> {L('सुन्नुहोस्', 'Speak')}
          </button>
        </div>
      )}

      {/* ── Main 2D Scene & Interactive Zones ─────────────────── */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '440px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          padding: 16,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
          alignItems: 'stretch',
        }}
      >
        {/* Zone 1: Village House (भित्र vs बाहिर) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '2px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 16, color: '#187C68' }}>
            <span>🏠</span>
            <span>{L('नेपाली गाउँको घर (भित्र र बाहिर)', 'Village House (Inside & Outside)')}</span>
          </div>

          {/* House Inside Zone */}
          <div
            onClick={() => handlePlaceInZone('inside_house')}
            style={{
              flex: 1,
              minHeight: 120,
              background: '#FEF3C7',
              borderRadius: 12,
              border: '2px dashed #F59E0B',
              padding: 10,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#92400E', display: 'flex', justifyContent: 'space-between' }}>
              <span>🚪 {L('घरभित्र (Inside the House)', 'Inside House (भित्र)')}</span>
              <span style={{ fontSize: 11, color: '#B45309' }}>{L('यहाँ राख्न थिच्नुहोस्', 'Tap to drop')}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '8px 0' }}>
              {getItemsInZone('inside_house').map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{it.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Outside (Veranda) Zone */}
          <div
            onClick={() => handlePlaceInZone('outside_house')}
            style={{
              flex: 1,
              minHeight: 120,
              background: '#DCFCE7',
              borderRadius: 12,
              border: '2px dashed #16A34A',
              padding: 10,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#166534', display: 'flex', justifyContent: 'space-between' }}>
              <span>🏡 {L('पिँढी / घरबाहिर (Outside the House)', 'Outside Veranda (बाहिर)')}</span>
              <span style={{ fontSize: 11, color: '#15803D' }}>{L('यहाँ राख्न थिच्नुहोस्', 'Tap to drop')}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '8px 0' }}>
              {getItemsInZone('outside_house').map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{it.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 2: Picnic Table & Tree (माथि vs तल) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '2px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 16, color: '#187C68' }}>
            <span>🌳</span>
            <span>{L('रूख र टेबल (माथि र तल)', 'Tree & Table (Above & Below)')}</span>
          </div>

          {/* Above Zone (Top Branches / On Table) */}
          <div
            onClick={() => handlePlaceInZone(mode === 'INSIDE_OUTSIDE' ? 'above_table' : 'above_tree')}
            style={{
              flex: 1,
              minHeight: 120,
              background: '#E0F2FE',
              borderRadius: 12,
              border: '2px dashed #0284C7',
              padding: 10,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#0369A1', display: 'flex', justifyContent: 'space-between' }}>
              <span>☁️ {L('माथि (Above / Up High on Branches)', 'Above (माथि)')}</span>
              <span style={{ fontSize: 11, color: '#0284C7' }}>{L('यहाँ राख्न थिच्नुहोस्', 'Tap to drop')}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '8px 0' }}>
              {[...getItemsInZone('above_tree'), ...getItemsInZone('above_table')].map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{it.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Below Zone (Under Tree / Under Table) */}
          <div
            onClick={() => handlePlaceInZone(mode === 'INSIDE_OUTSIDE' ? 'below_table' : 'below_tree')}
            style={{
              flex: 1,
              minHeight: 120,
              background: '#F1F5F9',
              borderRadius: 12,
              border: '2px dashed #64748B',
              padding: 10,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
              <span>🌱 {L('तल (Below / Ground under Table)', 'Below (तल)')}</span>
              <span style={{ fontSize: 11, color: '#475569' }}>{L('यहाँ राख्न थिच्नुहोस्', 'Tap to drop')}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '8px 0' }}>
              {[...getItemsInZone('below_tree'), ...getItemsInZone('below_table')].map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{it.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 3: Woven Basket (डालोभित्र vs डालोबाहिर) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '2px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 16, color: '#187C68' }}>
            <span>🧺</span>
            <span>{L('बाँसको डालो (भित्र र बाहिर)', 'Woven Basket (Inside & Outside)')}</span>
          </div>

          {/* Basket Inside */}
          <div
            onClick={() => handlePlaceInZone('inside_basket')}
            style={{
              flex: 1,
              minHeight: 120,
              background: '#FDF2F8',
              borderRadius: 12,
              border: '2px dashed #DB2777',
              padding: 10,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#9D174D', display: 'flex', justifyContent: 'space-between' }}>
              <span>🧺 {L('डालोभित्र (Inside Basket)', 'Inside Basket (भित्र)')}</span>
              <span style={{ fontSize: 11, color: '#BE185D' }}>{L('यहाँ राख्न थिच्नुहोस्', 'Tap to drop')}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '8px 0' }}>
              {getItemsInZone('inside_basket').map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{it.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Basket Outside */}
          <div
            onClick={() => handlePlaceInZone('outside_basket')}
            style={{
              flex: 1,
              minHeight: 120,
              background: '#F3E8FF',
              borderRadius: 12,
              border: '2px dashed #9333EA',
              padding: 10,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#6B21A8', display: 'flex', justifyContent: 'space-between' }}>
              <span>🧺 {L('डालोबाइर (Outside Basket)', 'Outside Basket (बाहिर)')}</span>
              <span style={{ fontSize: 11, color: '#7E22CE' }}>{L('यहाँ राख्न थिच्नुहोस्', 'Tap to drop')}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '8px 0' }}>
              {getItemsInZone('outside_basket').map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{it.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Alert Overlay */}
        {feedback && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: feedback.ok ? '#10B981' : '#F59E0B',
              color: '#FFFFFF',
              padding: '16px 32px',
              borderRadius: 24,
              fontSize: 20,
              fontWeight: 900,
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              zIndex: 40,
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            {feedback.ok ? '🌟 ' : '💡 '}
            {feedback.text}
          </div>
        )}
      </div>

      {/* ── Bottom Item Tray (Select object to place) ─────────── */}
      <footer
        style={{
          background: '#FFFFFF',
          borderTop: '2px solid #E2E8F0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 14, color: '#187C68' }}>
          👇 {L('राख्नका लागि वस्तु छान्नुहोस्:', 'Choose item to place:')}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItemId(item.id);
                  AudioController.playPop();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 14,
                  border: isSelected ? '2px solid #187C68' : '1px solid #CBD5E1',
                  background: isSelected ? '#E6F3E9' : '#F8FAFC',
                  color: isSelected ? '#187C68' : '#334155',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.05)' : 'none',
                  transition: 'all 0.12s ease',
                  boxShadow: isSelected ? '0 4px 10px rgba(24,124,104,0.2)' : 'none',
                }}
              >
                <span style={{ fontSize: 24 }}>{item.emoji}</span>
                <span>{isNe ? item.nameNp : item.nameEn}</span>
                {item.currentZone && (
                  <span
                    style={{
                      fontSize: 10,
                      background: '#142D4E', borderBottom: '3px solid #167C80',
                      color: '#FFF',
                      padding: '2px 6px',
                      borderRadius: 6,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
