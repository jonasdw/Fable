// Copyright (c) Microsoft Corporation.  All Rights Reserved.  See License.txt in the project root for license information.

namespace FSharp.Compiler.CodeAnalysis

open System
open System.IO
open Internal.Utilities.Library
open FSharp.Compiler.IO
open FSharp.Compiler.Text

[<RequireQualifiedAccess>]
type TextContainer =
    | OnDisk
#if !FABLE_COMPILER
    | Stream of Stream
#endif
    | SourceText of ISourceText

    interface IDisposable with

        member this.Dispose() =
            match this with
#if !FABLE_COMPILER
            | Stream stream -> stream.Dispose()
#endif
            | _ -> ()

[<AbstractClass>]
type FSharpSource internal () =

    abstract FilePath: string

    abstract TimeStamp: DateTime

    abstract GetTextContainer: unit -> TextContainer

#if !FABLE_COMPILER

type private FSharpSourceMemoryMappedFile(filePath: string, timeStamp: DateTime, openStream: unit -> Stream) =
    inherit FSharpSource()

    override _.FilePath = filePath

    override _.TimeStamp = timeStamp

    override _.GetTextContainer() = openStream () |> TextContainer.Stream

type private FSharpSourceByteArray(filePath: string, timeStamp: DateTime, bytes: byte[]) =
    inherit FSharpSource()

    override _.FilePath = filePath

    override _.TimeStamp = timeStamp

    override _.GetTextContainer() =
        TextContainer.Stream(new MemoryStream(bytes, 0, bytes.Length, false) :> Stream)

type private FSharpSourceFromFile(filePath: string) =
    inherit FSharpSource()

    override _.FilePath = filePath

    override _.TimeStamp = FileSystem.GetLastWriteTimeShim(filePath)

    override _.GetTextContainer() = TextContainer.OnDisk

#endif //!FABLE_COMPILER

type private FSharpSourceCustom(filePath: string, getTimeStamp, getSourceText) =
    inherit FSharpSource()

    override _.FilePath = filePath

    override _.TimeStamp = getTimeStamp ()

    override _.GetTextContainer() =
        TextContainer.SourceText(getSourceText ())

type FSharpSource with

    static member Create(filePath, getTimeStamp, getSourceText) =
        FSharpSourceCustom(filePath, getTimeStamp, getSourceText) :> FSharpSource

#if !FABLE_COMPILER
    static member CreateFromFile(filePath: string) =
        FSharpSourceFromFile(filePath) :> FSharpSource

    static member CreateCopyFromFile(filePath: string) =
        let timeStamp = FileSystem.GetLastWriteTimeShim(filePath)

        let openStream =
            fun () -> FileSystem.OpenFileForReadShim(filePath, useMemoryMappedFile = true, shouldShadowCopy = true)

        FSharpSourceMemoryMappedFile(filePath, timeStamp, openStream) :> FSharpSource
#endif //!FABLE_COMPILER
