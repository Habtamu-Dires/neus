import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedStateService {


  readonly isSyncronizing = signal(false);


  constructor() { }

  updateIsSyncronizing(isSyncronizing: boolean) {
    this.isSyncronizing.set(isSyncronizing);
  }

  // exma type list
  examTypeList:string[] = [
    'TEST',
    'ERMP',
    'USMLE_STEP_1',
    'USMLE_STEP_2',
    'NGAT',
    'LICENSURE',
  ]

  // resouce list
  resouceTypeList:string[] = [
    'EXAM',
    'READING_MATERIAL',
    'VIDEO',
    'BOOK',
    'READING_MATERIALS',
    'LECTURE_VIDEOS',
    'LECTURE_NOTES',
    'ERMP',
    'USMLE_STEP_1',
    'USMLE_STEP_2',
    'NGAT',
    'LICENSURE',
    'LECTURES',
    'BOOKS'
  ]
  
  // department list
  departmentList:string[] = [
    'Anatomy',
    'Internal_Medicine',
    'Pediatrics',
    'OBGYN',
    'Surgery',
    'Medical_Ethics',
    'Dermatology',
    'Ophthalmology',
    'Psychiatry',
    'ENT',
    'Pathology',
    'Medical_Radiology',
    'Anesthesiology',
    'Behavioral_Science',
    'Biochemistry',
    'Biostatics',
    'Embryology',
    'Genetics',
    'Histology',
    'Immunology',
    'Microbiology',
    'Pathophysiology',
    'Pharmacology',
    'Physiology',
    'Others',
  ];

  // blockList
  blockNumberList:string[] = [
    'BLOCK_01',
    'BLOCK_02',
    'BLOCK_03',
    'BLOCK_04',
    'BLOCK_05',
    'BLOCK_06',
    'BLOCK_07',
    'BLOCK_08',
    'BLOCK_09',
    'BLOCK_11',
    'BLOCK_12',
    'BLOCK_13',
    'BLOCK_14',
    'BLOCK_15',
    'BLOCK_16',
    'BLOCK_17',
    'BLOCK_18',
    'BLOCK_19',
    'BLOCK_20', 
    'BLOCK_21',
  ]
}
