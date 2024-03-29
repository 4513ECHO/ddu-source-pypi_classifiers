import type { ActionData } from "https://deno.land/x/ddu_kind_word@v0.1.2/word.ts";
import {
  BaseSource,
  type OnInitArguments,
} from "https://deno.land/x/ddu_vim@v3.6.0/base/source.ts";
import type { Item } from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";
import { TextLineStream } from "https://deno.land/std@0.200.0/streams/text_line_stream.ts";
import { ChunkedStream } from "https://deno.land/x/chunked_stream@0.1.2/mod.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params, ActionData> {
  override kind = "word";
  #stream?: () => ReadableStream<Item<ActionData>[]>;

  override async onInit(args: OnInitArguments<Params>): Promise<void> {
    const response = await fetch(
      "https://pypi.org/pypi?%3Aaction=list_classifiers",
    );
    if (!response.ok) {
      await args.denops.call(
        "ddu#util#print_error",
        "Failed to fetch response",
        "ddu-source-pypi_classifiers",
      );
      return;
    }
    this.#stream = () =>
      response.clone().body!
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TextLineStream())
        .pipeThrough(
          new TransformStream<string, Item<ActionData>>({
            transform: (chunk, controller) =>
              controller.enqueue({
                word: chunk,
                action: { text: chunk },
              }),
          }),
        )
        .pipeThrough(new ChunkedStream({ chunkSize: 100 }));
  }

  override gather(_args: unknown): ReadableStream<Item<ActionData>[]> {
    return this.#stream!();
  }

  override params(): Params {
    return {};
  }
}
