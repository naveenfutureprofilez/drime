import React from 'react';

// Plus icon matching Figma design exactly - combines horizontal and vertical lines
export const FigmaPlusIcon = ({   className = "" }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 13V27" stroke="#08CF65" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M26 20H13" stroke="#08CF65" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M2 20C2 6.50099 6.50099 2 20 2C33.4991 2 38 6.50099 38 20C38 33.4991 33.4991 38 20 38C6.50099 38 2 33.4991 2 20Z" stroke="#08CF65" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

);

// Settings icon matching Figma design exactly  
export const FigmaSettingsIcon = ({ size = 20, className = "" }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.3389 6.35293L16.8202 5.45285C16.3814 4.69125 15.409 4.42852 14.6463 4.86552C14.2833 5.07937 13.8501 5.14005 13.4423 5.03416C13.0345 4.92827 12.6855 4.66452 12.4724 4.30106C12.3353 4.07004 12.2616 3.80691 12.2588 3.53829C12.2712 3.1076 12.1087 2.69025 11.8084 2.38131C11.5081 2.07237 11.0955 1.89814 10.6646 1.89832H9.61962C9.19751 1.89832 8.7928 2.06651 8.49504 2.36571C8.19728 2.6649 8.03102 3.07041 8.03305 3.49252C8.02054 4.36402 7.31044 5.06393 6.43885 5.06384C6.17022 5.06105 5.90709 4.98737 5.67607 4.85026C4.91343 4.41326 3.94097 4.676 3.50216 5.4376L2.94533 6.35293C2.50705 7.11358 2.76621 8.08542 3.52504 8.52684C4.01829 8.81162 4.32215 9.33791 4.32215 9.90747C4.32215 10.477 4.01829 11.0033 3.52504 11.2881C2.76717 11.7265 2.50773 12.696 2.94533 13.4544L3.47165 14.3621C3.67725 14.7331 4.02221 15.0068 4.4302 15.1228C4.83819 15.2387 5.27557 15.1873 5.64556 14.9799C6.00927 14.7677 6.4427 14.7096 6.84949 14.8184C7.25628 14.9273 7.60274 15.1941 7.81184 15.5596C7.94895 15.7907 8.02263 16.0538 8.02542 16.3224C8.02542 17.2029 8.73917 17.9166 9.61962 17.9166H10.6646C11.5421 17.9166 12.2546 17.2075 12.2588 16.33C12.2568 15.9066 12.4241 15.4999 12.7235 15.2005C13.0229 14.9011 13.4296 14.7338 13.853 14.7358C14.121 14.743 14.3831 14.8164 14.6158 14.9494C15.3765 15.3877 16.3483 15.1285 16.7897 14.3697L17.3389 13.4544C17.5515 13.0895 17.6098 12.6549 17.501 12.2469C17.3922 11.8389 17.1252 11.491 16.7592 11.2805C16.3932 11.0699 16.1262 10.7221 16.0174 10.314C15.9086 9.90601 15.9669 9.47143 16.1795 9.10655C16.3177 8.8652 16.5179 8.66508 16.7592 8.52684C17.5135 8.08566 17.772 7.1195 17.3389 6.36056V6.35293Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.146 12.1043C11.3593 12.1043 12.3428 11.1207 12.3428 9.90749C12.3428 8.69423 11.3593 7.71069 10.146 7.71069C8.93276 7.71069 7.94922 8.69423 7.94922 9.90749C7.94922 11.1207 8.93276 12.1043 10.146 12.1043Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);
export const CalenderIcon = ({ size = 20, className = "" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.48828 9.66626H20.5297" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.1426 3V5.96174" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.87134 3V5.96174" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.3184 4.42188H8.69804C6.05446 4.42188 4.4043 5.89399 4.4043 8.59984V16.7456C4.4043 19.4943 6.05446 21.0004 8.69804 21.0004H16.3106C18.962 21.0004 20.6044 19.5205 20.6044 16.8137V8.59984C20.6121 5.89399 18.9698 4.42188 16.3184 4.42188Z" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.49414 13.3711H8.50414" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.49414 16.8477H8.50414" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.5137 13.3711H12.5237" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.5137 16.8477H12.5237" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5234 13.3711H16.5334" stroke="#646A73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

// Close icon matching Figma design exactly
export const FigmaCloseIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6.53033 5.46967C6.23744 5.17678 5.76256 5.17678 5.46967 5.46967C5.17678 5.76256 5.17678 6.23744 5.46967 6.53033L10.9393 12L5.46967 17.4697C5.17678 17.7626 5.17678 18.2374 5.46967 18.5303C5.76256 18.8232 6.23744 18.8232 6.53033 18.5303L12 13.0607L17.4697 18.5303C17.7626 18.8232 18.2374 18.8232 18.5303 18.5303C18.8232 18.2374 18.8232 17.7626 18.5303 17.4697L13.0607 12L18.5303 6.53033C18.8232 6.23744 18.8232 5.76256 18.5303 5.46967C18.2374 5.17678 17.7626 5.17678 17.4697 5.46967L12 10.9393L6.53033 5.46967Z" fill="currentColor"/>
  </svg>
);

// Video icon matching Figma design exactly
export const FigmaVideoIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 26 36" fill="none" className={className}>
    <path d="M23.5787 6.70413V29.7957H5.26445C2.93037 29.7957 1.03809 27.9712 1.03809 25.7207V2.62915H19.3523C21.6864 2.62915 23.5787 4.45365 23.5787 6.70413Z" fill="#FF274A"/>
    <path d="M16.8035 16.2352L15.1186 17.173L11.214 19.3469L9.52344 20.288V12.176L11.214 13.1171L15.1191 15.2909L16.7973 16.2249L16.8035 16.2352Z" fill="white"/>
  </svg>
);

// Generic document icon for other file types
export const FigmaDocumentIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 26 36" fill="none" className={className}>
    <path d="M23.5787 6.70413V29.7957H5.26445C2.93037 29.7957 1.03809 27.9712 1.03809 25.7207V2.62915H19.3523C21.6864 2.62915 23.5787 4.45365 23.5787 6.70413Z" fill="#4F46E5"/>
    <rect x="6" y="10" width="12" height="2" fill="white" rx="1"/>
    <rect x="6" y="14" width="14" height="2" fill="white" rx="1"/>
    <rect x="6" y="18" width="10" height="2" fill="white" rx="1"/>
    <rect x="6" y="22" width="13" height="2" fill="white" rx="1"/>
  </svg>
);

// Image icon similar to Figma style
export const FigmaImageIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 26 36" fill="none" className={className}>
    <path d="M23.5787 6.70413V29.7957H5.26445C2.93037 29.7957 1.03809 27.9712 1.03809 25.7207V2.62915H19.3523C21.6864 2.62915 23.5787 4.45365 23.5787 6.70413Z" fill="#06B6D4"/>
    <circle cx="10" cy="14" r="3" fill="white"/>
    <path d="M6 22L10 18L14 22L18 18L20 20V26H6V22Z" fill="white"/>
  </svg>
);

// Audio icon similar to Figma style
export const VideoIcon = ({ size = 32, className = "" }) => (
  <svg width="26" height="36" viewBox="0 0 26 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.5787 6.70413V29.7957H5.26445C2.93037 29.7957 1.03809 27.9712 1.03809 25.7207V2.62915H19.3523C21.6864 2.62915 23.5787 4.45365 23.5787 6.70413Z" fill="#FF274A"/>
<path d="M16.8035 16.2352L15.1186 17.173L11.214 19.3469L9.52344 20.288V12.176L11.214 13.1171L15.1191 15.2909L16.7973 16.2249L16.8035 16.2352Z" fill="white"/>
</svg>
);
export const CloseIcon = ({ size = 32, className = "" }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.53033 0.469668C1.23744 0.176777 0.762558 0.176777 0.469668 0.469668C0.176777 0.762558 0.176777 1.23744 0.469668 1.53033L5.9393 7L0.469668 12.4697C0.176777 12.7626 0.176777 13.2374 0.469668 13.5303C0.762558 13.8232 1.23744 13.8232 1.53033 13.5303L7 8.0607L12.4697 13.5303C12.7626 13.8232 13.2374 13.8232 13.5303 13.5303C13.8232 13.2374 13.8232 12.7626 13.5303 12.4697L8.0607 7L13.5303 1.53033C13.8232 1.23744 13.8232 0.762558 13.5303 0.469668C13.2374 0.176777 12.7626 0.176777 12.4697 0.469668L7 5.9393L1.53033 0.469668Z" fill="black"/>
</svg>

);
export const ImportFolderIcon = ({ size = 32, className = "" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_204_70)">
    <path d="M15.6409 19.9874C18.9967 19.9874 20.9738 18.0094 20.9738 14.6546L21 9.9989C21 6.57609 19.7584 4.86421 16.3948 4.86421H13.7415C13.0682 4.86227 12.4348 4.54554 12.0296 4.00827L11.1737 2.86961C10.7695 2.33137 10.1361 2.01367 9.46278 2.01367H7.58768C4.23193 2.01367 3 3.99079 3 7.34168V14.6546C3 18.0094 4.981 19.9874 8.34452 19.9874H15.6409Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.80078 11.4173L11.9994 9.209M11.9994 9.209L14.199 11.4173M11.9994 9.209L12 15.3725" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
    <clipPath id="clip0_204_70">
    <rect width="24" height="24" fill="white"/>
    </clipPath>
    </defs>
    </svg>

);
export const FigmaAudioIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 26 36" fill="none" className={className}>
    <path d="M23.5787 6.70413V29.7957H5.26445C2.93037 29.7957 1.03809 27.9712 1.03809 25.7207V2.62915H19.3523C21.6864 2.62915 23.5787 4.45365 23.5787 6.70413Z" fill="#8B5CF6"/>
    <path d="M15 12V24C15 25.1046 14.1046 26 13 26C11.8954 26 11 25.1046 11 24C11 22.8954 11.8954 22 13 22C13.5523 22 14.0522 22.2239 14.4142 22.5858C14.7761 22.9478 15 23.4477 15 24V12Z" fill="white"/>
    <circle cx="13" cy="16" r="1" fill="white"/>
  </svg>
);

export const ImportFileIcon = ({ size = 32, className = "" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_204_65)">
    <g clip-path="url(#clip1_204_65)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.7366 2.76178H8.08465C6.00465 2.75381 4.30065 4.41081 4.25065 6.49081V17.2278C4.20565 19.3298 5.87365 21.0698 7.97465 21.1148C8.01165 21.1148 8.04865 21.1158 8.08465 21.1148H16.0726C18.1626 21.0408 19.8146 19.3188 19.8027 17.2278V8.03781L14.7366 2.76178Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.4749 2.75011V5.65911C14.4749 7.07911 15.6239 8.23011 17.0439 8.23411H19.7979" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.6409 9.90881V15.9498" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.9866 12.2643L11.6416 9.9093L9.29663 12.2643" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </g>
    <defs>
    <clipPath id="clip0_204_65">
    <rect width="24" height="24" fill="white"/>
    </clipPath>
    <clipPath id="clip1_204_65">
    <rect width="24" height="24" fill="white"/>
    </clipPath>
    </defs>
    </svg>
);