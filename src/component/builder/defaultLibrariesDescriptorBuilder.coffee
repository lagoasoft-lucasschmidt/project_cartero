_ = require 'lodash'
path = require 'path'
Q = require 'q'

LibrariesDescriptorBuilder = require '../../model/librariesDescriptorBuilder'
Library = require '../../model/library'
LibraryCreator = require '../../model/libraryCreator'
DefaultLibraryCreator = require '../libraryCreator/DefaultLibraryCreator'

defaultOptions =
  libraryCreators:[DefaultLibraryCreator] # they are responsible to create a library, if they can. They must respect the interface LibraryCreator

class DefaultLibrariesDescriptorBuilder extends LibrariesDescriptorBuilder
  constructor:(options)->
    super("DEFAULT_LIBRARIES_DESC_BUILDER", options)
    @options = _.defaults options, defaultOptions
    throw new Error("librariesPath is required") if !_.isString(@options.librariesPath) or @options.librariesPath.length is 0
    throw new Error("libraryCreators must be specified") if !_.isArray(@options.libraryCreators)
    # load library creators
    @libraryCreators = @internalSetupLibraryCreators()
    throw new Error("libraryCreators must be valid LibraryCreator instances") if @libraryCreators.length is 0

    @_allLibraries = {} # it will be a map, that maps eg: mylib/subLib to Library instance

  internalSetupLibraryCreators:()=>
    @libraryCreators = _.map @options.libraryCreators, (libraryCreator)=>
      @trace "Initiating libraryCreator #{libraryCreator}"
      creator = null
      if _.isFunction(libraryCreator) then creator = libraryCreator
      else if _.isString(libraryCreator) and libraryCreator.length > 0
        try
          creator = require libraryCreator
        catch error
          @trace msg: "Error while trying to require libraryCreator=#{libraryCreator}", error: error
      if _.isFunction(creator) then return @internalSetupLibraryCreator(creator)
      else throw new Error("Cant initiate libraryCreator=#{libraryCreator}, since its not a function")

    @libraryCreators = _.filter @libraryCreators, (libraryCreator)-> libraryCreator?

  internalSetupLibraryCreator:(creator)=>
    libraryCreator = new creator(@options)
    if libraryCreator instanceof LibraryCreator then return libraryCreator
    else
      @warn "LibraryCreator #{libraryCreator} isnt instanceof LibraryCreator, this shouldnt happen"
      return null

  internalCreateLibrary:(libraryId)=>
    Q.fcall ()=>
      throw new Error("LibraryId must be informed") if !_.isString(libraryId)
      @trace "Trying to create library id=#{libraryId}, will attempt to choose libraryCreator"
      @internalChooseLibraryCreator(libraryId)
    .then (libraryCreator)=>
      if not libraryCreator then throw new Error("LibraryCreator couldnt be found for library id=#{libraryId}")
      @internalCreateLibraryByLibraryCreator(libraryId, libraryCreator)
    .then (library)=>
      if not library then throw new Error("LibraryCreator couldnt create library id=#{libraryId}, no errors were given, this shoudnt happen")
      @_allLibraries[libraryId] = library
      return library
    .fail (error)=>
      @trace msg:"Error while trying to create library id=#{libraryId}", error: error
      return null

  internalChooseLibraryCreator:(libraryId)=>
    @trace "Trying to choose library creator for library id=#{libraryId}"
    promises = (@internalCanLibraryCreatorCreateLibrary(libraryId, creator) for creator in @libraryCreators)
    Q.all(promises)
    .then (answers)=>
      for answer, i in answers
        if answer is true
          creator = @libraryCreators[i]
          @trace "Creator with name #{creator.name} can create library id=#{libraryId}"
          return creator
      @warn "No creators can create library id=#{libraryId}"
      return null

  internalCreateLibraryByLibraryCreator:(libraryId, creator)=>
    deferred = Q.defer()
    creator.createLibrary libraryId, @, @options, (error, newLibrary)=>
      if error then return deferred.reject(new Error(error))
      else return deferred.resolve(newLibrary)
    deferred.promise

  internalCanLibraryCreatorCreateLibrary:(libraryId, creator)=>
    deferred = Q.defer()
    creator.canCreateLibrary libraryId, @, @options, (error, can)=>
      if error then return deferred.reject(new Error(error))
      else return deferred.resolve(can)
    deferred.promise

  getLibrary:(libraryId)=>
    Q.fcall ()=>
      throw new Error("LibraryId must be informed") if !_.isString(libraryId)
      @trace "Trying to get library id=#{libraryId}"
      if @_allLibraries[libraryId]? and  @_allLibraries[libraryId] instanceof Library
        @trace "Found library id=#{libraryId} already cached"
        Q.fcall ()=> @_allLibraries[libraryId]
      else
        @trace "Couldnt find library id=#{libraryId} into cache, will attempt to load properly"
        @internalCreateLibrary(libraryId)

  getCalculatedLibraries:()=> @_allLibraries


module.exports = DefaultLibrariesDescriptorBuilder
