import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html'
})
export class SearchBoxComponent implements OnInit {

  @Input() useProperties: Array<string> = [];
  @Input() resultMaxLength: number = 0;
  @Input() highlight: boolean = false;
  @Input() highlightClass: string = "highlight";
  @Input() targetList: Array<any> = [];
  @Output() resultList: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  searchText: string = "";
  options: Array<string> = ["Intuitive", "Strict"];
  selectedType: string = this.options[0];
  searchTextArray: Array<string> = [];
  predictedTextsArray: Array<any> = [];
  predictionPercentage: number = 70;
  tolerance: number = 2;

  constructor() { }

  ngOnInit() {
    this._emitList(this.targetList);
  }

  onChangeSearchText() {
    this.searchTextArray = [];
    if (this.targetList.length) {
      this.searchTextArray = this.searchText.split(" ").filter(Boolean);
      if (this._getMaxLength(this.searchTextArray) > 1) {
        this._emitList(this._search(this._processTargetArray()));
      }
      else {
        this._emitList(this.targetList);
      }
    }
  }

  private _search(inputArray: Array<any>) {
    let outputArray: Array<any> = [];
    this.predictedTextsArray = [];

    this.searchTextArray.forEach(text => {
      if (text.length > 1) {
        inputArray.forEach(element => {
          let keys = [];
          if (this.useProperties.length) {
            keys = this.useProperties;
          }
          else {
            keys = Object.keys(element);
          }
          keys.forEach(key => {
            if (key !== "matchedCount" && typeof element[key] !== "object" && element.hasOwnProperty(key)) {
              if (this.selectedType == this.options[0]) {
                // intuitive search
                this._intuitiveMatch(text, element, key);
              }
              else if (this.selectedType == this.options[1]) {
                // basic search - strict search
                if (element[key].toString().toLowerCase().indexOf(text.toLowerCase()) != -1) {
                  element.matchedCount++;
                }
              }
            }
          });
        });
      }
    });

    return this._processOutputArray(inputArray);
  }

  private _intuitiveMatch(searchText: string, element: any, key: string) {
    let elementText = element[key].toString();
    let finalPredictedText = "";
    this.tolerance = (this.tolerance < 0) ? 2 : this.tolerance;

    if (elementText.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
      element.matchedCount++;
      finalPredictedText = searchText;
      if (this.predictedTextsArray.indexOf(finalPredictedText) == -1) {
        this.predictedTextsArray.push(finalPredictedText);
      }
    }
    else {
      let matchedPoint = 0;

      let elementTextArray = elementText.split(' ');

      elementTextArray.forEach(targetText => {
        let predictedText = "";
        let i = 0, j = 0, k = 0, c = 0;

        let x = targetText.toLowerCase().indexOf(searchText.toLowerCase().charAt(0));
        if (x != -1) {
          for (i = x; i < searchText.length; i++) {
            let y = (i > k) ? i : k;
            let found = false;
            for (j = y; (j < targetText.length) && (j <= y + this.tolerance); j++) {
              if (searchText.toLowerCase().charAt(i) == targetText.toLowerCase().charAt(j)) {
                c++;
                k = j + 1;
                predictedText += targetText.charAt(j);
                found = true;
                break;
              }
              else {
                predictedText += " ";
              }
            }
            predictedText = predictedText.trim();
            if(!found) {
              k = 0;
              predictedText += " ";
            }
          }
        }

        if ((c / searchText.length) > matchedPoint) {
          matchedPoint = c / searchText.length;
          finalPredictedText = predictedText;
        }

      });

      if (matchedPoint * 100 > this.predictionPercentage) {
        element.matchedCount += matchedPoint;
        finalPredictedText = finalPredictedText.toLowerCase().trim();
        finalPredictedText = finalPredictedText.replace(/\s+/g, "(\\S{0," + this.tolerance + "}?)");
        if (this.predictedTextsArray.indexOf(finalPredictedText) == -1) {
          this.predictedTextsArray.push(finalPredictedText);
        }
        console.log(this.predictedTextsArray);
      }
    }
  }

  private _processTargetArray() {
    let inputArray: Array<any> = [];
    this.targetList.forEach(element => {
      inputArray.push(Object.assign({}, element));
    });
    if (typeof inputArray[0] !== "object") {
      let processedArray: Array<any> = [];
      inputArray.forEach(element => {
        processedArray.push({ customSearchValue: element, matchedCount: 0 });
      });
      return processedArray;
    }
    else {
      inputArray.map(element => {
        element.matchedCount = 0.0;
      });
      return inputArray;
    }
  }

  private _processOutputArray(outputArray: Array<any>) {
    let processedArray: Array<any> = [];

    if (outputArray.length) {

      outputArray = outputArray.sort((a, b) => b.matchedCount - a.matchedCount);

      let temp = [];
      outputArray.forEach(element => {
        if (element.matchedCount == 0) return false;
        temp.push(element);
      });
      outputArray = temp;

      outputArray.forEach(element => {
        if (this.highlight) {
          this._highlight(element);
        }
        delete element.matchedCount;
      });

      if (this.resultMaxLength > 0 && outputArray.length > this.resultMaxLength) {
        outputArray.splice(this.resultMaxLength, outputArray.length - this.resultMaxLength);
      }

      if (typeof this.targetList[0] !== "object" && outputArray[0].hasOwnProperty('customSearchValue')) {
        let processedArray: Array<any> = [];
        outputArray.forEach(element => {
          processedArray.push(element.customSearchValue);
        });
      }
      else {
        processedArray = outputArray;
      }
    }

    return processedArray;
  }

  private _highlight(element: any) {
    if (this.highlight) {
      let keys, regx;
      if (this.useProperties.length) {
        keys = this.useProperties;
      }
      else {
        keys = Object.keys(element);
      }

      if (this.selectedType == this.options[0]) {
        regx = new RegExp(this.predictedTextsArray.join("|"), "gim");
      }
      if (this.selectedType == this.options[1]) {
        regx = new RegExp(this.searchTextArray.join("|"), "gim");
      }
      keys.forEach(key => {
        if (typeof element[key] !== "object") {
          element[key] = element[key].toString().replace(regx, (x) => '<span class="' + this.highlightClass + '">' + x + '</span>');
        }
      });
    }
  }

  private _getMaxLength(textList: Array<string>) {
    let maxLength: number = 0;
    textList.forEach(element => {
      maxLength = (element.length > maxLength) ? element.length : maxLength;
    });
    return maxLength;
  }

  private _emitList(list: Array<any>) {
    this.resultList.emit(list);
  }

}