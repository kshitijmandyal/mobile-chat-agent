import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import SdStorageRoundedIcon from '@mui/icons-material/SdStorageRounded';
import StayCurrentPortraitRoundedIcon from '@mui/icons-material/StayCurrentPortraitRounded';
import type { SvgIconComponent } from '@mui/icons-material';

import type { SpecRow, SpecKey } from '../helpers/format';
import styles from './SpecTile.module.scss';

const ICONS: Record<SpecKey, SvgIconComponent> = {
  camera: PhotoCameraRoundedIcon,
  battery: BatteryChargingFullRoundedIcon,
  storage: SdStorageRoundedIcon,
  display: StayCurrentPortraitRoundedIcon,
  processor: MemoryRoundedIcon,
  weight: ScaleRoundedIcon,
};

export function SpecTile({ spec }: { spec: SpecRow }) {
  const Icon = ICONS[spec.key];
  return (
    <div className={styles.tile}>
      <span className={styles.icon} aria-hidden>
        <Icon fontSize="small" />
      </span>
      <div className={styles.text}>
        <span className={styles.label}>{spec.label}</span>
        <span className={styles.value}>{spec.value}</span>
      </div>
    </div>
  );
}
