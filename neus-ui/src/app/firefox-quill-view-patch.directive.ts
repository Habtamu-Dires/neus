// src/app/firefox-quill-view-patch.directive.ts (Further Updated with increased delay)

import { Directive, ElementRef, AfterViewInit, OnChanges, SimpleChanges, Input } from '@angular/core';

@Directive({
  selector: '[appFirefoxQuillViewPatch]'
})
export class FirefoxQuillViewPatchDirective implements AfterViewInit, OnChanges {

  @Input('appFirefoxQuillViewPatch') quillHtmlContent: string | undefined;

  private isFirefox = navigator.userAgent.includes('Firefox');
  private hasViewInitialized = false; // Flag to ensure DOM is ready
  // You could add a flag for initial patch run too if needing different delays
  // private initialPatchApplied = false;


  constructor(private el: ElementRef<HTMLElement>) {
      // el.nativeElement is the div the directive is attached to
  }

  ngAfterViewInit(): void {
     this.hasViewInitialized = true;
     // ngOnChanges will trigger for the initial content value if it's set early.
     // If the input is set later, ngOnChanges handles it too.
     // We rely on ngOnChanges + the small delay to handle initial render timing.
  }

  ngOnChanges(changes: SimpleChanges): void {
      // ngOnChanges fires for initial value and subsequent changes
      if (this.isFirefox && changes['quillHtmlContent']) {
           const newContent = changes['quillHtmlContent'].currentValue;
           const oldContent = changes['quillHtmlContent'].previousValue;

           // Only trigger patch if content actually changed and is not null/undefined
           // Or if it's the initial set (oldContent is null/undefined) and the new content is not null/undefined
           if (newContent && newContent !== oldContent || (newContent && oldContent === undefined)) {
            //    console.log('Directive: quillHtmlContent input changed or set initially. Triggering patch with delay...');
               // *** Trigger patch with a small fixed delay ***
               this.applyPatchDelayed(50); // <-- Try 50ms, adjust if needed (e.g., 100ms)
           } else if (newContent === null || newContent === undefined) {
               // Handle case where content is explicitly set to null/undefined (e.g., clearing editor)
            //    console.log('Directive: quillHtmlContent input set to null/undefined.');
               // You might want to clear any applied styles here if necessary,
               // but typically Quill/quill-view handles clearing innerHTML.
           }
      }
  }

  ngOnDestroy(): void {
      // Cleanup here if needed (not for this setTimeout approach)
  }


  private applyPatchDelayed(delay: number): void {
       // Clear any previous timeouts to avoid patching multiple times if changes happen quickly
       // This requires storing the timeout ID. Let's keep it simple for now.
       // If changes are rapid, a more advanced debouncing/throttling might be needed.

       // Use setTimeout with the specified delay
       setTimeout(() => {
           // Add checks to ensure view is ready before proceeding
           if (!this.hasViewInitialized) {
                // console.warn(`Directive: Patch attempted before view initialization confirmed after ${delay}ms delay.`);
                 // Could potentially reschedule if needed, but let's see if this fixes it
                 // setTimeout(() => this.applyPatchDelayed(delay), 10); // Reschedule attempt?
                return;
           }
        //    console.log(`Directive Timeout fired after ${delay}ms. Applying Firefox patch...`);
           const container = this.el.nativeElement;

           // Find the rendered content element (quill-view's output)
           const renderedContentElement = container.querySelector('.ql-editor') || container;

           // Add checks to ensure the element is found and has content
           if (!renderedContentElement || renderedContentElement.innerHTML === '' || renderedContentElement.childElementCount === 0) {
            //    console.warn(`Directive patch: Rendered content element is empty or not found yet after ${delay}ms.`);
               // This warning might still appear if the delay isn't long enough,
               // or if the content is genuinely empty.
               return;
           }


           // --- Apply the patch logic ---
           const imageWrappers: NodeListOf<Element> = renderedContentElement.querySelectorAll('span[class^="ql-image-align-"]');

           if (imageWrappers.length === 0) {
            //    console.log('Directive patch: No image wrappers found.');
           }

           imageWrappers.forEach((wrapperElement: Element) => {
              const wrapperSpan = wrapperElement as HTMLSpanElement;
              const img = wrapperSpan.querySelector('img');

              if (!img) return;

              const imgWidthAttr = img.getAttribute('width');

              if (imgWidthAttr) {
                  const resizeWidthValue = imgWidthAttr.includes('px') ? imgWidthAttr : imgWidthAttr + 'px';
                  wrapperSpan.style.setProperty('--resize-width', resizeWidthValue);
                  // console.log(`Directive patch: Set --resize-width to:`, resizeWidthValue);
              } else {
                //    console.warn(`Directive patch: Image has no width attribute.`);
               }
           });
           // --- End of patch logic ---

        //    console.log(`Directive Firefox patch finished after ${delay}ms.`);

       }, delay); // Use the specified delay
   }

   // Helper to trigger patch with the default delay
   // This is what ngOnChanges will call
   private applyPatchWithDefaultDelay(): void {
       const delay = 50; // Default small delay
       this.applyPatchDelayed(delay);
   }
}